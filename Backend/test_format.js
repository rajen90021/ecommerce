import axios from 'axios';

const test = async () => {
    try {
        const prodRes = await axios.get('http://127.0.0.1:3000/api/products?limit=1');
        console.log('Product Format:', JSON.stringify(prodRes.data.products[0], null, 2));
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
};

test();
