import axios from "axios";

export const updateOrderStatus = async (
    orderId: string,
    status: string
) => {
    await axios.put(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`,
        { status }
    );
};