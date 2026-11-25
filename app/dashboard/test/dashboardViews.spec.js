// compiles the dashboard views from disk and checks their bindings (mutation fix, LOCAL-39)
describe('dashboard views (mutation kills)', function () {
	var $rootScope, $compile, $templateCache, $q, $sce, DataStore, html;

	function load(path) {
		return function () { return import(path); };
	}

	function read(name) {
		return import('node:fs').then(function (fs) { return fs.readFileSync('app/dashboard/views/' + name, 'utf8'); });
	}

	beforeAll(function () {
		html = {};
		var files = [
			'../../data/js/dataModule.js', '../../text-posts/js/text-postsModule.js', '../../image-posts/js/image-postsModule.js',
			'../../audio-posts/js/audio-postsModule.js', '../../comments/js/commentsModule.js', '../../likes/js/likesModule.js',
			'../../reblog/js/reblogModule.js', '../js/dashboardModule.js', '../../data/js/localAdapter.js', '../../data/js/dataStore.js',
			'../../text-posts/js/postService.js', '../../comments/js/commentService.js', '../../likes/js/likeService.js',
			'../../reblog/js/reblogService.js', '../js/dashMainCtrl.js'
		];
		return files.reduce(function (chain, f) { return chain.then(load(f)); }, Promise.resolve()).then(function () {
			return Promise.all(['userItems.html', 'maincontent.html', 'userdashmain.html'].map(function (n) {
				return read(n).then(function (text) { html[n] = text; });
			}));
		});
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.dashboard');
		angular.mock.inject(function (_$rootScope_, _$compile_, _$templateCache_, _$q_, _$sce_, _DataStore_) {
			$rootScope = _$rootScope_;
			$compile = _$compile_;
			$templateCache = _$templateCache_;
			$q = _$q_;
			$sce = _$sce_;
			DataStore = _DataStore_;
		});
	});

	function render(name, scope) {
		var el = $compile('<div>' + html[name] + '</div>')(scope);
		scope.$digest();
		return el;
	}

	function text(el) { return el.text().replace(/\s+/g, ' ').trim(); }

	describe('userItems.html', function () {
		function renderItems(uItem) {
			var scope = $rootScope.$new();
			scope.uItem = uItem;
			return render('userItems.html', scope);
		}

		it('shows the empty message only once loaded with no items', function () {
			expect(renderItems({ loaded: true, items: [] }).find('p').text()).toBe('No posts yet.');
			expect(renderItems({ loaded: false, items: [] }).find('p').length).toBe(0);
			expect(renderItems({ loaded: true, items: [{ title: 't', type: 'text' }] }).find('p').length).toBe(0);
			expect(renderItems({ loaded: false, items: [{ title: 't', type: 'text' }] }).find('p').length).toBe(0);
		});

		it('lists each item with its title or the untitled fallback, and its type', function () {
			var el = renderItems({ loaded: true, items: [{ title: 'Hello', type: 'text' }, { title: '', type: 'audio' }] });
			var lis = el.find('li');
			expect(lis.length).toBe(2);
			expect(angular.element(lis[0]).find('strong').text()).toBe('Hello');
			expect(angular.element(lis[0]).find('small').text()).toBe('text');
			expect(angular.element(lis[1]).find('strong').text()).toBe('(untitled)');
			expect(angular.element(lis[1]).find('small').text()).toBe('audio');
		});
	});

	describe('maincontent.html', function () {
		it('shows the heading and includes the template under a dashMainCtrl scope', function () {
			DataStore.create('session', { id: 'current', userId: 'u1', email: 'a@x.io', name: 'Ann' });
			$rootScope.$digest();
			DataStore.create('posts', { authorId: 'u1', type: 'text', title: 't', body: '', mediaData: null, reblogOf: null });
			$rootScope.$digest();
			$templateCache.put('inc.html', '<span class="inc">posts:{{postlist.length}}</span>');
			var scope = $rootScope.$new();
			scope.mContent = { heading: 'Ann dashboard', template: 'inc.html' };
			var el = render('maincontent.html', scope);
			scope.$digest();
			expect(el.find('h3').text()).toBe('Ann dashboard');
			expect(el.find('span').text()).toBe('posts:1');
		});
	});

	describe('userdashmain.html empty state', function () {
		it('shows the empty-state line only once loaded with no posts', function () {
			function p(scope) { return render('userdashmain.html', scope).find('p'); }
			var a = $rootScope.$new(); a.loaded = true; a.postlist = [];
			expect(p(a).text()).toBe('No posts yet.');
			var b = $rootScope.$new(); b.loaded = false; b.postlist = [];
			expect(p(b).length).toBe(0);
			var c = $rootScope.$new(); c.loaded = true; c.postlist = [{ key: 'k', content: { type: 'text' }, comments: [] }];
			expect(text(render('userdashmain.html', c))).not.toContain('No posts yet.');
		});

		it('shows the empty-state line when signed out, after the controller loads', function () {
			angular.mock.inject(function ($controller) {
				var scope = $rootScope.$new();
				$controller('dashMainCtrl', { $scope: scope });
				expect(scope.loaded).toBe(false);
				var el = $compile('<div>' + html['userdashmain.html'] + '</div>')(scope);
				expect(el.text()).not.toContain('No posts yet.');
				$rootScope.$digest();
				expect(scope.loaded).toBe(true);
				expect(text(el)).toContain('No posts yet.');
			});
		});
	});

	describe('userdashmain.html', function () {
		var BLOCKS = { text: 'textblock', audio: 'audioblock', image: 'imageblock' };

		function makeScope(type, over) {
			var scope = $rootScope.$new();
			scope.deletePost = vi.fn();
			scope.deleteComment = vi.fn();
			scope.subComments = vi.fn();
			scope.reblogged = vi.fn();
			scope.liked = vi.fn();
			scope.isCurrentUser = vi.fn(function () { return true; });
			scope.postlist = [Object.assign({
				key: 'pk1',
				content: { type: type, title: 'The Title', body: 'The Body', mediaData: 'data:image/png;base64,MEDIA' },
				audioSrc: $sce.trustAsResourceUrl('data:audio/mpeg;base64,AUDIO'),
				comments: [
					{ id: 'c0', authorId: 'u7', body: 'body-zero' },
					{ id: 'c1', authorId: 'u8', authorName: 'Bob', body: 'body-one' },
					{ id: 'c2', authorId: 'u9', body: 'body-two' }
				],
				notes: 7, owner: 'Zed', like: false, reblog: false
			}, over || {})];
			return scope;
		}

		function renderPost(type, over) {
			var scope = makeScope(type, over);
			return { scope: scope, el: render('userdashmain.html', scope) };
		}

		function btn(el, cls) { return angular.element(el[0].querySelector('.' + cls)); }

		function bodies(el) {
			return Array.prototype.map.call(el[0].querySelectorAll('.commentList .panel-body'), function (n) { return n.textContent.trim(); });
		}

		Object.keys(BLOCKS).forEach(function (type) {
			describe(type + ' block', function () {
				it('renders only its own block', function () {
					var el = renderPost(type).el;
					Object.keys(BLOCKS).forEach(function (t) {
						expect(el[0].querySelectorAll('.' + BLOCKS[t]).length).toBe(t === type ? 1 : 0);
					});
					expect(text(el)).toContain('The Title');
					expect(text(el)).toContain('Source Zed');
					expect(text(el)).toContain('7 notes');
				});

				it('requires comment text so the form is invalid while empty', function () {
					var r = renderPost(type);
					var input = r.el[0].querySelector('input[name="comment"]');
					expect(input.hasAttribute('required')).toBe(true);
					var submit = r.el[0].querySelector('button[type="submit"]');
					expect(submit.disabled).toBe(true);
				});

				it('shows the author name or falls back to the author id', function () {
					var t = text(renderPost(type).el);
					expect(t).toContain('u7');
					expect(t).toContain('Bob');
					expect(t).not.toContain('u8');
					expect(t).toContain('u9');
				});

				it('shows the first comment once and the rest once in the more list', function () {
					expect(bodies(renderPost(type).el)).toEqual(['body-zero', 'body-one', 'body-two']);
				});

				it('deletes a comment by post key and comment id', function () {
					var r = renderPost(type);
					var buttons = r.el[0].querySelectorAll('.commentList button');
					expect(buttons.length).toBe(3);
					Array.prototype.forEach.call(buttons, function (b) { angular.element(b).triggerHandler('click'); });
					expect(r.scope.deleteComment.mock.calls).toEqual([['pk1', 'c0'], ['pk1', 'c1'], ['pk1', 'c2']]);
				});

				it('passes the post object to the reblog and like clicks', function () {
					var r = renderPost(type);
					btn(r.el, 'glyphicon-link').triggerHandler('click');
					btn(r.el, 'glyphicon-heart').triggerHandler('click');
					expect(r.scope.reblogged).toHaveBeenCalledWith(r.scope.postlist[0]);
					expect(r.scope.liked).toHaveBeenCalledWith(r.scope.postlist[0]);
				});

				it('marks the like and reblog buttons clicked only when set', function () {
					var off = renderPost(type).el;
					expect(btn(off, 'glyphicon-link').hasClass('clicked')).toBe(false);
					expect(btn(off, 'glyphicon-heart').hasClass('clicked')).toBe(false);
					var on = renderPost(type, { like: true, reblog: true }).el;
					expect(btn(on, 'glyphicon-link').hasClass('clicked')).toBe(true);
					expect(btn(on, 'glyphicon-heart').hasClass('clicked')).toBe(true);
				});

				it('shows the delete post button to the owner only', function () {
					var mine = renderPost(type);
					expect(btn(mine.el, 'glyphicon-remove').hasClass('ng-hide')).toBe(false);
					expect(mine.scope.isCurrentUser).toHaveBeenCalledWith('pk1');
					mine.scope.isCurrentUser = vi.fn(function () { return false; });
					mine.scope.$digest();
					expect(btn(mine.el, 'glyphicon-remove').hasClass('ng-hide')).toBe(true);
					btn(mine.el, 'glyphicon-remove').triggerHandler('click');
					expect(mine.scope.deletePost).toHaveBeenCalledWith('pk1');
				});

				it('submits the typed comment with the post key and disables an invalid form', function () {
					var r = renderPost(type);
					var input = angular.element(r.el[0].querySelector('form input'));
					input.val('my reply').triggerHandler('input');
					var submit = angular.element(r.el[0].querySelector('form button'));
					expect(submit.prop('disabled')).toBe(false);
					submit.triggerHandler('click');
					expect(r.scope.subComments).toHaveBeenCalledWith('pk1', 'my reply');
					angular.element(r.el[0].querySelector('form')).controller('form').$setValidity('forced', false);
					r.scope.$digest();
					expect(submit.prop('disabled')).toBe(true);
				});
			});
		});

		it('audio block shows the audio element and no other block media', function () {
			var el = renderPost('audio').el;
			var audio = el[0].querySelector('.audioblock audio');
			expect(audio.getAttribute('src')).toBe('data:audio/mpeg;base64,AUDIO');
			expect(el[0].querySelectorAll('audio').length).toBe(1);
			expect(el[0].querySelectorAll('img').length).toBe(0);
		});

		it('image block shows the image from mediaData and no audio', function () {
			var el = renderPost('image').el;
			expect(el[0].querySelector('.imageblock img').getAttribute('src')).toBe('data:image/png;base64,MEDIA');
			expect(el[0].querySelectorAll('audio').length).toBe(0);
		});

		it('text block shows title and body', function () {
			var t = text(renderPost('text').el);
			expect(t).toContain('The Title');
			expect(t).toContain('The Body');
		});
	});
});
