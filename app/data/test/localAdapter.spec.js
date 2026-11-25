describe('LocalAdapter', function () {
	var adapter;

	beforeAll(function () {
		return import('../js/dataModule.js')
			.then(function () { return import('../js/localAdapter.js'); });
	});

	beforeEach(function () {
		localStorage.clear();
		angular.mock.module('funglr.data');
		angular.mock.inject(function (_LocalAdapter_) {
			adapter = _LocalAdapter_;
		});
	});

	function caught(fn) {
		try { fn(); } catch (err) { return err; }
		return null;
	}

	it('update persists the merged record to storage and pins the id', function () {
		adapter.create('users', { id: 'a', name: 'A', email: 'e' });
		var out = adapter.update('users', 'a', { name: 'B', id: 'other' });
		expect(out.id).toBe('a');
		var stored = JSON.parse(localStorage.getItem('funglr:users'));
		expect(Object.keys(stored)).toEqual(['a']);
		expect(stored.a.name).toBe('B');
		expect(stored.a.email).toBe('e');
		expect(stored.a.id).toBe('a');
		expect(adapter.get('users', 'a').name).toBe('B');
	});

	it('update tolerates a missing patch', function () {
		adapter.create('users', { id: 'a', name: 'A' });
		var out = adapter.update('users', 'a');
		expect(out.name).toBe('A');
		expect(out.id).toBe('a');
		expect(JSON.parse(localStorage.getItem('funglr:users')).a.name).toBe('A');
	});

	it('update persists the session document directly under funglr:session', function () {
		adapter.create('session', { id: 'current', userId: 'u1' });
		var out = adapter.update('session', 'current', { userId: 'u2' });
		expect(out.id).toBe('current');
		var stored = JSON.parse(localStorage.getItem('funglr:session'));
		expect(stored.userId).toBe('u2');
		expect(stored.id).toBe('current');
		expect(adapter.get('session', 'current').userId).toBe('u2');
	});

	it('list with a multi-field filter returns only records matching all fields', function () {
		adapter.create('likes', { id: 'l1', postId: 'p1', userId: 'u1' });
		adapter.create('likes', { id: 'l2', postId: 'p1', userId: 'u2' });
		adapter.create('likes', { id: 'l3', postId: 'p2', userId: 'u1' });
		var out = adapter.list('likes', { postId: 'p1', userId: 'u1' });
		expect(out.length).toBe(1);
		expect(out[0].id).toBe('l1');
		expect(adapter.list('likes', { postId: 'p2', userId: 'u2' })).toEqual([]);
	});

	it('list and create throw invalid for an unknown collection', function () {
		var l = caught(function () { adapter.list('nope'); });
		expect(l && l.code).toBe('invalid');
		var c = caught(function () { adapter.create('nope', { id: 'x' }); });
		expect(c && c.code).toBe('invalid');
		expect(localStorage.getItem('funglr:nope')).toBeNull();
	});

	it('create on the session collection defaults the id and sets createdAt', function () {
		var rec = adapter.create('session', { userId: 'u1' });
		expect(rec.id).toBe('current');
		expect(typeof rec.createdAt).toBe('string');
		expect(Number.isNaN(Date.parse(rec.createdAt))).toBe(false);
		var stored = JSON.parse(localStorage.getItem('funglr:session'));
		expect(stored.id).toBe('current');
		expect(stored.createdAt).toBe(rec.createdAt);
		var bad = caught(function () { adapter.create('session', { id: 'x' }); });
		expect(bad && bad.code).toBe('invalid');
	});

	it('get/update/remove reject not-found for inherited property names', function () {
		adapter.create('users', { id: 'a' });
		['constructor', 'toString', '__proto__'].forEach(function (id) {
			expect((caught(function () { adapter.get('users', id); }) || {}).code).toBe('not-found');
			expect((caught(function () { adapter.update('users', id, { name: 'x' }); }) || {}).code).toBe('not-found');
			expect((caught(function () { adapter.remove('users', id); }) || {}).code).toBe('not-found');
		});
	});

	it('corrupt JSON in storage throws invalid and is not overwritten', function () {
		localStorage.setItem('funglr:users', '{not json');
		expect((caught(function () { adapter.list('users'); }) || {}).code).toBe('invalid');
		expect((caught(function () { adapter.create('users', { id: 'a' }); }) || {}).code).toBe('invalid');
		expect(localStorage.getItem('funglr:users')).toBe('{not json');
	});
});
