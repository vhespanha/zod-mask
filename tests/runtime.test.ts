import { expect, test } from 'bun:test';
import * as z from 'zod';
import '../index.js';

const User = z.object({
	id: z.uuid().mask('read'),
	name: z.string().mask('read', 'create', 'update'),
	friends: z.array(z.uuid()).mask('read', 'update'),
});

test('read keeps only read-masked fields', () => {
	const ReadUser = User.read();
	const result = ReadUser.parse({
		id: 'f143985f-9448-4460-9325-4ad9cc104f82',
		name: 'Ada',
		friends: ['8be311f5-a7be-44f0-a7ee-bccad4ed652e'],
	});

	expect(result).toEqual({
		id: 'f143985f-9448-4460-9325-4ad9cc104f82',
		name: 'Ada',
		friends: ['8be311f5-a7be-44f0-a7ee-bccad4ed652e'],
	});
	expect(Object.keys(ReadUser.shape).sort()).toEqual(['friends', 'id', 'name']);
});

test('create keeps only create-masked fields', () => {
	const CreateUser = User.create();
	const result = CreateUser.parse({
		name: 'Ada',
	});

	expect(result).toEqual({ name: 'Ada' });
	expect(Object.keys(CreateUser.shape)).toEqual(['name']);
});

test('update keeps only update-masked fields', () => {
	const UpdateUser = User.update();
	const result = UpdateUser.parse({
		name: 'Ada',
		friends: ['8be311f5-a7be-44f0-a7ee-bccad4ed652e'],
	});

	expect(result).toEqual({
		name: 'Ada',
		friends: ['8be311f5-a7be-44f0-a7ee-bccad4ed652e'],
	});
	expect(Object.keys(UpdateUser.shape).sort()).toEqual(['friends', 'name']);
});

test('fields without mask are excluded from all filtered schemas', () => {
	const Mixed = z.object({
		visible: z.string().mask('read'),
		hidden: z.string(),
	});

	expect(Object.keys(Mixed.read().shape)).toEqual(['visible']);
	expect(Object.keys(Mixed.create().shape)).toEqual([]);
	expect(Object.keys(Mixed.update().shape)).toEqual([]);
});

test('mask metadata is stored and returned through meta()', () => {
	const schema = z.string().mask('read', 'update');
	expect(schema.meta()?.mask).toEqual(['read', 'update']);
});
