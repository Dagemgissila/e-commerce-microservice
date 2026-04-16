import { Request, Response } from "express";
import * as productService from "../services/product.service";

export const create = async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
};

export const getAll = async (req: Request, res: Response) => {
    const { category } = req.query;
    const products = await productService.getAllProducts(category as string);
    res.json(products);
};

export const getOne = async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id as string);
    res.json(product);
};

export const update = async (req: Request, res: Response) => {
    const product = await productService.updateProduct(
        req.params.id as string,
        req.body
    );
    res.json(product);
};

export const remove = async (req: Request, res: Response) => {
    const result = await productService.deleteProduct(req.params.id as string);
    res.json(result);
};