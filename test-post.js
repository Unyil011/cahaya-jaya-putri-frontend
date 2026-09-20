
const axios = require('axios');
async function test() {
    try {
        console.log('Logging in...');
        const res = await axios.get('http://cahayajaya.wuaze.com/api-masuk.php?email=client@gmail.com&password=12345678');
        const token = res.data.token;
        console.log('Got token:', token.substring(0, 15) + '...');
        
        console.log('Sending order request...');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('payload_string', JSON.stringify({
            items: [{ itemName: 'Test Item', quantity: '10', unit: 'pcs' }]
        }));
        
        const order = await axios.post('http://cahayajaya.wuaze.com/backend/create-pesanan', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Bearer ' + token
            }
        });
        console.log('Order created!', order.data);
    } catch(e) {
        console.error('Error:', e.message);
        if (e.response) {
            console.error('Data:', e.response.data);
            console.error('Status:', e.response.status);
        }
    }
}
test();

