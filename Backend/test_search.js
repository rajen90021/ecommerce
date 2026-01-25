import axios from 'axios';

const testSearch = async () => {
    try {
        console.log('--- Searching for "Shirt" ---');
        let res = await axios.get('http://localhost:3000/api/products/search?q=Shirt');
        console.log('Results:', res.data.products.length);
        if (res.data.products.length > 0) {
            console.log('Example:', res.data.products[0].product_name);
        }

        console.log('\n--- Searching for "mens" ---');
        res = await axios.get('http://localhost:3000/api/products/search?q=mens');
        console.log('Results:', res.data.products.length);
    } catch (e) {
        console.error('Error:', e.message);
    }
};

testSearch();
