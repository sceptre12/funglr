describe('DataStore', function () {
	var DataStore, $rootScope;

	beforeAll(function () {
		return import('../js/dataModule.js')
			.then(function () { return import('../js/localAdapter.js'); })
			.then(function () { return import('../js/dataStore.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.data');
		angular.mock.inject(function (_DataStore_, _$rootScope_) {
			DataStore = _DataStore_;
			$rootScope = _$rootScope_;
		});
	});

	function settle(promise) {
		var out = {};
		promise.then(function (v) { out.ok = v; }, function (e) { out.err = e; });
		$rootScope.$digest();
		return out;
	}

	it('create assigns id and createdAt and stores under funglr:<collection>', function () {
		var r = settle(DataStore.create('posts', { authorId: 'u1', type: 'text', title: 't' }));
		expect(r.ok.id).toBeTruthy();
		expect(r.ok.createdAt).toBeTruthy();
		expect(JSON.parse(localStorage.getItem('funglr:posts'))[r.ok.id].title).toBe('t');
	});

	it('create rejects exists on a taken id', function () {
		settle(DataStore.create('users', { id: 'a' }));
		expect(settle(DataStore.create('users', { id: 'a' })).err.code).toBe('exists');
	});

	it('get resolves the record or rejects not-found', function () {
		settle(DataStore.create('users', { id: 'a', name: 'A' }));
		expect(settle(DataStore.get('users', 'a')).ok.name).toBe('A');
		expect(settle(DataStore.get('users', 'zz')).err.code).toBe('not-found');
	});

	it('list returns all, or exact-match filtered records', function () {
		settle(DataStore.create('comments', { id: 'c1', postId: 'p1' }));
		settle(DataStore.create('comments', { id: 'c2', postId: 'p2' }));
		expect(settle(DataStore.list('comments')).ok.length).toBe(2);
		var f = settle(DataStore.list('comments', { postId: 'p2' })).ok;
		expect(f.length).toBe(1);
		expect(f[0].id).toBe('c2');
		expect(settle(DataStore.list('likes')).ok).toEqual([]);
	});

	it('update merges or rejects not-found', function () {
		settle(DataStore.create('users', { id: 'a', name: 'A', email: 'e' }));
		var m = settle(DataStore.update('users', 'a', { name: 'B' })).ok;
		expect(m.name).toBe('B');
		expect(m.email).toBe('e');
		expect(settle(DataStore.update('users', 'zz', {})).err.code).toBe('not-found');
	});

	it('remove resolves true or rejects not-found', function () {
		settle(DataStore.create('follows', { id: 'a:b' }));
		expect(settle(DataStore.remove('follows', 'a:b')).ok).toBe(true);
		expect(settle(DataStore.remove('follows', 'a:b')).err.code).toBe('not-found');
	});

	it('rejects invalid for an unknown collection', function () {
		expect(settle(DataStore.get('nope', 'x')).err.code).toBe('invalid');
	});

	it('stores the session document directly under funglr:session', function () {
		settle(DataStore.create('session', { id: 'current', userId: 'u1', email: 'e', name: 'n', signedInAt: 'now' }));
		expect(JSON.parse(localStorage.getItem('funglr:session')).userId).toBe('u1');
		expect(settle(DataStore.get('session', 'current')).ok.userId).toBe('u1');
		expect(settle(DataStore.create('session', { id: 'current' })).err.code).toBe('exists');
		expect(settle(DataStore.remove('session', 'current')).ok).toBe(true);
		expect(localStorage.getItem('funglr:session')).toBeNull();
		expect(settle(DataStore.get('session', 'current')).err.code).toBe('not-found');
	});

	it('reset clears every funglr:* key and only those', function () {
		settle(DataStore.create('users', { id: 'a' }));
		settle(DataStore.create('session', { id: 'current' }));
		localStorage.setItem('other', 'keep');
		expect(settle(DataStore.reset()).ok).toBe(true);
		expect(localStorage.getItem('funglr:users')).toBeNull();
		expect(localStorage.getItem('funglr:session')).toBeNull();
		expect(localStorage.getItem('other')).toBe('keep');
	});

	it('maps a numeric QuotaExceededError code to invalid', function () {
		var spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function () {
			var err = new Error('quota');
			err.name = 'QuotaExceededError';
			err.code = 22;
			throw err;
		});
		var r = settle(DataStore.create('posts', { id: 'p1' }));
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
		expect(r.err.code).toBe('invalid');
	});

	it('surfaces corrupt stored JSON as invalid', function () {
		localStorage.setItem('funglr:posts', '{oops');
		expect(settle(DataStore.list('posts')).err.code).toBe('invalid');
	});
});
