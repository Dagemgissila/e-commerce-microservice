import { prisma } from "../../lib/prisma";
import { redis } from "../config/redis";

export const createProduct = async (data: any) => {
    const product = await prisma.product.create({ data });
    await redis.del("products");
    return product;
};

export const getAllProducts = async () => {
    const cached = await redis.get("products");

    if (cached) {
        console.log("CACHE HIT - ALL PRODUCTS");
        return JSON.parse(cached);
    }

    console.log("CACHE MISS - DB HIT");

    const products = await prisma.product.findMany();

    await redis.set("products", JSON.stringify(products), "EX", 60);

    return products;
};

export const getProductById = async (id: string) => {
    const cached = await redis.get(`product:${id}`);

    if (cached) {
        console.log("CACHE HIT - SINGLE PRODUCT");
        return JSON.parse(cached);
    }

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (product) {
        await redis.set(
            `product:${id}`,
            JSON.stringify(product),
            "EX",
            60
        );
    }

    return product;
};

// UPDATE
export const updateProduct = async (id: string, data: any) => {
    const product = await prisma.product.update({
        where: { id },
        data,
    });

    // clear cache
    await redis.del(`product:${id}`);
    await redis.del("products");

    return product;
};

// DELETE
export const deleteProduct = async (id: string) => {
    await prisma.product.delete({
        where: { id },
    });

    await redis.del(`product:${id}`);
    await redis.del("products");

    return { message: "Product deleted" };
};