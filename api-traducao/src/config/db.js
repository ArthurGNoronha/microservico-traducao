import { connect } from 'mongoose';

const config = async (url) => {
    try {
        const connection = await connect(url);
        console.log('Database connected successfully:', connection.connection.name);
    } catch(err) {
        console.error('Database connection error:', err.message);
    }
}

export default {
    config
}