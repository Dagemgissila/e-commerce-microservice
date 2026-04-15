import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                console.log(`Validation failed: ${JSON.stringify(errors)}`);

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }
            next(error);
        }
    };
};