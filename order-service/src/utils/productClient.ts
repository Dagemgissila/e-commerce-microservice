import axios from "axios";

export const getProduct = async (productId: string) => {
    const response = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`,
        {
            headers: {
                "x-internal-secret": process.env.INTERNAL_SECRET,
            },
        }
    );

    return response.data;
};