import * as z from 'zod';

type Mask = 'read' | 'create' | 'update';
type SchemaMask<Masks extends readonly Mask[]> = { readonly __mask?: Masks };
type SchemaMasks<Schema> = Schema extends { readonly __mask?: infer Masks } ? Masks : never;
type BaseSchema<Schema> = Schema extends (infer Original) & SchemaMask<readonly Mask[]>
	? Original
	: Schema;

type IncludesMask<Schema, CurrentMask extends Mask> = Schema extends {
	readonly __mask?: readonly Mask[];
}
	? SchemaMasks<Schema> extends readonly Mask[]
		? CurrentMask extends SchemaMasks<Schema>[number]
			? true
			: false
		: false
	: false;

type MaskedShape<Shape extends z.core.$ZodShape, CurrentMask extends Mask> = {
	[Key in keyof Shape as IncludesMask<Shape[Key], CurrentMask> extends true
		? Key
		: never]: BaseSchema<Shape[Key]>;
};

declare module 'zod' {
	interface GlobalMeta {
		mask?: ReadonlyArray<Mask>;
	}

	interface ZodType {
		mask<const Masks extends ReadonlyArray<Mask>>(...masks: Masks): this & SchemaMask<Masks>;
	}

	interface ZodObject {
		read<Shape extends z.core.$ZodShape, Config extends z.core.$ZodObjectConfig>(
			this: z.ZodObject<Shape, Config>,
		): z.ZodObject<MaskedShape<Shape, 'read'>, Config>;
		create<Shape extends z.core.$ZodShape, Config extends z.core.$ZodObjectConfig>(
			this: z.ZodObject<Shape, Config>,
		): z.ZodObject<MaskedShape<Shape, 'create'>, Config>;
		update<Shape extends z.core.$ZodShape, Config extends z.core.$ZodObjectConfig>(
			this: z.ZodObject<Shape, Config>,
		): z.ZodObject<MaskedShape<Shape, 'update'>, Config>;
	}
}

function isMask(value: unknown): value is Mask {
	return value === 'read' || value === 'create' || value === 'update';
}

function hasMask(value: unknown, currentMask: Mask): value is ReadonlyArray<Mask> {
	return (
		Array.isArray(value) && value.every((item) => isMask(item)) && value.includes(currentMask)
	);
}

function maskObject<Shape extends z.core.$ZodShape, Config extends z.core.$ZodObjectConfig>(
	schema: z.ZodObject<Shape, Config>,
	currentMask: Mask,
) {
	const pickMask: Partial<Record<keyof Shape, true>> = {};

	for (const key of Object.keys(schema.shape) as Array<keyof Shape>) {
		const field = schema.shape[key] as unknown as z.ZodType;
		const candidate = field.meta()?.mask;
		if (hasMask(candidate, currentMask)) {
			pickMask[key] = true;
		}
	}

	return schema.pick(pickMask as never);
}

z.ZodType.prototype.mask = function <
	Schema extends z.ZodType,
	const Masks extends ReadonlyArray<Mask>,
>(this: Schema, ...masks: Masks): Schema & SchemaMask<Masks> {
	return this.meta({ mask: masks });
};

z.ZodObject.prototype.read = function <
	Shape extends z.core.$ZodShape,
	Config extends z.core.$ZodObjectConfig,
>(this: z.ZodObject<Shape, Config>): z.ZodObject<MaskedShape<Shape, 'read'>, Config> {
	return maskObject(this, 'read') as unknown as z.ZodObject<MaskedShape<Shape, 'read'>, Config>;
};

z.ZodObject.prototype.create = function <
	Shape extends z.core.$ZodShape,
	Config extends z.core.$ZodObjectConfig,
>(this: z.ZodObject<Shape, Config>): z.ZodObject<MaskedShape<Shape, 'create'>, Config> {
	return maskObject(this, 'create') as unknown as z.ZodObject<
		MaskedShape<Shape, 'create'>,
		Config
	>;
};

z.ZodObject.prototype.update = function <
	Shape extends z.core.$ZodShape,
	Config extends z.core.$ZodObjectConfig,
>(this: z.ZodObject<Shape, Config>): z.ZodObject<MaskedShape<Shape, 'update'>, Config> {
	return maskObject(this, 'update') as unknown as z.ZodObject<
		MaskedShape<Shape, 'update'>,
		Config
	>;
};
