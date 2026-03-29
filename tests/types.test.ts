import * as z from 'zod';
import '../main';

const User = z.object({
	id: z.uuid().mask('read'),
	name: z.string().mask('read', 'create', 'update'),
	friends: z.array(z.uuid()).mask('read', 'update'),
});

const ReadUser = User.read();
const CreateUser = User.create();
const UpdateUser = User.update();

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type ExpectedReadShape = {
	id: z.ZodUUID;
	name: z.ZodString;
	friends: z.ZodArray<z.ZodUUID>;
};

type ExpectedCreateShape = {
	name: z.ZodString;
};

type ExpectedUpdateShape = {
	name: z.ZodString;
	friends: z.ZodArray<z.ZodUUID>;
};

const _readSchemaMatches: z.ZodObject<ExpectedReadShape, z.core.$strip> = ReadUser;
const _createSchemaMatches: z.ZodObject<ExpectedCreateShape, z.core.$strip> = CreateUser;
const _updateSchemaMatches: z.ZodObject<ExpectedUpdateShape, z.core.$strip> = UpdateUser;

// @ts-expect-error id must not exist on create schema
CreateUser.shape.id;

// @ts-expect-error id must not exist on update schema
UpdateUser.shape.id;

type _ReadOutput = z.output<typeof ReadUser>;
type _CreateOutput = z.output<typeof CreateUser>;
type _UpdateOutput = z.output<typeof UpdateUser>;

type _ReadOutputExact = Expect<
	Equal<
		_ReadOutput,
		{
			id: string;
			name: string;
			friends: Array<string>;
		}
	>
>;

type _CreateOutputExact = Expect<
	Equal<
		_CreateOutput,
		{
			name: string;
		}
	>
>;

type _UpdateOutputExact = Expect<
	Equal<
		_UpdateOutput,
		{
			name: string;
			friends: Array<string>;
		}
	>
>;
