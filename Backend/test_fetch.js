import axios from 'axios';

const test = async () => {
    try {
        const catRes = await axios.get('http://127.0.0.1:3000/api/categories');
        console.log('Categories Count:', catRes.data.categories?.length || 0);

        const prodRes = await axios.get('http://127.0.0.1:3000/api/products');
        console.log('Products Count:', prodRes.data.products?.length || 0);
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
};

test();
