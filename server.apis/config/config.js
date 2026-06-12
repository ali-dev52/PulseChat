const PRI = '/api/v1';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export { 
    MONGODB_URI,
    PORT, 
    PRI, 
    JWT_SECRET,
    STRIPE_SECRET_KEY
};