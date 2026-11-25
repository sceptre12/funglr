(function () {
	'use strict';

	var PREFIX = 'funglr:';
	var COLLECTIONS = ['users', 'posts', 'comments', 'likes', 'follows', 'session'];
	var SESSION_ID = 'current';
	var counter = 0;

	function fail(code, message) {
		return { code: code, message: message };
	}

	function check(collection) {
		if (COLLECTIONS.indexOf(collection) === -1) {
			throw fail('invalid', 'unknown collection: ' + collection);
		}
	}

	function newId() {
		counter += 1;
		return Date.now().toString(36) + counter.toString(36) + Math.random().toString(36).slice(2, 8);
	}

	function LocalAdapter() {
		function readRaw(key) {
			var raw = localStorage.getItem(key);
			if (raw === null || raw === undefined) { return null; }
			try { return JSON.parse(raw); } catch (e) { return null; }
		}

		function writeRaw(key, value) {
			localStorage.setItem(key, JSON.stringify(value));
		}

		function readMap(collection) {
			return readRaw(PREFIX + collection) || {};
		}

		function writeMap(collection, map) {
			writeRaw(PREFIX + collection, map);
		}

		function isSession(collection) {
			return collection === 'session';
		}

		function copy(value) {
			return JSON.parse(JSON.stringify(value));
		}

		this.get = function (collection, id) {
			check(collection);
			var rec;
			if (isSession(collection)) {
				rec = id === SESSION_ID ? readRaw(PREFIX + 'session') : null;
			} else {
				rec = readMap(collection)[id];
			}
			if (!rec) { throw fail('not-found', collection + '/' + id + ' not found'); }
			return rec;
		};

		this.list = function (collection, filter) {
			check(collection);
			var all;
			if (isSession(collection)) {
				var doc = readRaw(PREFIX + 'session');
				all = doc ? [doc] : [];
			} else {
				var map = readMap(collection);
				all = Object.keys(map).map(function (k) { return map[k]; });
			}
			if (!filter) { return all; }
			return all.filter(function (rec) {
				return Object.keys(filter).every(function (f) { return rec[f] === filter[f]; });
			});
		};

		this.create = function (collection, record) {
			check(collection);
			if (!record || typeof record !== 'object') { throw fail('invalid', 'record must be an object'); }
			var rec = copy(record);
			if (isSession(collection)) {
				if (rec.id === undefined) { rec.id = SESSION_ID; }
				if (rec.id !== SESSION_ID) { throw fail('invalid', 'session id must be ' + SESSION_ID); }
				if (readRaw(PREFIX + 'session')) { throw fail('exists', 'session exists'); }
				rec.createdAt = new Date().toISOString();
				writeRaw(PREFIX + 'session', rec);
				return rec;
			}
			var map = readMap(collection);
			if (rec.id === undefined || rec.id === null) { rec.id = newId(); }
			if (Object.prototype.hasOwnProperty.call(map, rec.id)) {
				throw fail('exists', collection + '/' + rec.id + ' exists');
			}
			rec.createdAt = new Date().toISOString();
			map[rec.id] = rec;
			writeMap(collection, map);
			return rec;
		};

		this.update = function (collection, id, patch) {
			var rec = copy(this.get(collection, id));
			var changes = patch || {};
			Object.keys(changes).forEach(function (k) { rec[k] = changes[k]; });
			rec.id = id;
			if (isSession(collection)) {
				writeRaw(PREFIX + 'session', rec);
			} else {
				var map = readMap(collection);
				map[id] = rec;
				writeMap(collection, map);
			}
			return rec;
		};

		this.remove = function (collection, id) {
			this.get(collection, id);
			if (isSession(collection)) {
				localStorage.removeItem(PREFIX + 'session');
			} else {
				var map = readMap(collection);
				delete map[id];
				writeMap(collection, map);
			}
			return true;
		};

		this.reset = function () {
			var keys = [];
			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key && key.indexOf(PREFIX) === 0) { keys.push(key); }
			}
			keys.forEach(function (k) { localStorage.removeItem(k); });
			return true;
		};
	}

	angular.module('funglr.data').factory('LocalAdapter', function () {
		return new LocalAdapter();
	});
})();
