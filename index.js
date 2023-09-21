const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const TableUser = require('./models/table-user');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });


const app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// MongoDB'ye bağlanma
mongoose.connect('mongodb://127.0.0.1:27017/admin_login', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Ana sayfa
app.get('/', (req, res) => {
    res.render('login');
});

// Kullanıcı girişi
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.send('Invalid username or password');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        // You can render the dashboard view here
        res.render('dashboard');
    } else {
        res.redirect('/');
    }
});


// Kullanıcılar sayfası
app.get('/kullanicilar', async (req, res) => {
    if (req.session.user) {
        try {
            const users = await TableUser.find(); // Tabloya verileri userlists koleksiyonundan çekin

            res.render('kullanicilar', { users });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.redirect('/');
    }
});

// Kullanıcı ekleme işlemi
app.post('/addUser', (req, res) => {
    const newUsername = req.body.username;
    const newUser = new TableUser({
        username: newUsername,
    });

    newUser.save()
        .then(() => {
            console.log('User added to the database:', newUser);
            res.redirect('/kullanicilar');
        })
        .catch((err) => {
            console.error(err);
            res.redirect('/kullanicilar');
        });
});

// Kullanıcı silme işlemi
app.get('/deleteUser/:id', (req, res) => {
    const userId = req.params.id;

    TableUser.findByIdAndRemove(userId)
        .then(() => {
            console.log('User deleted from the database');
            res.redirect('/kullanicilar');
        })
        .catch(error => {
            console.error(error);
            res.redirect('/kullanicilar');
        });
});

// Kullanıcı çıkışı
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


const Product = require('./models/product');

app.post('/addProduct', upload.single('productImage'), async (req, res) => {
    try {
        const { productName, productDescription, productPrice } = req.body;
        const productImage = req.file.filename; // Dosya adı

        const newProduct = new Product({
            productName,
            productDescription,
            productImage,
            productPrice
        });

        await newProduct.save();

        res.redirect('/product'); // Ana sayfaya yönlendirme
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('index', { products });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/product', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('products', { products }); // "products" şablonunu kullanarak ürünleri listeleyin
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await Product.findByIdAndRemove(productId);
        res.sendStatus(204); // Başarılı yanıt, içerik yok (No Content)
    } catch (error) {
        console.error(error);
        res.sendStatus(500); // Sunucu hatası yanıtı
    }
});





// Admin Kullanıcısı Oluşturma
// const createAdminUser = async () => {
//     const existingAdmin = await User.findOne({ username: 'admin2' });
//     if (!existingAdmin) {
//         const adminPassword = 'admin2'; // Şifrenizi buraya girin
//         const hashedPassword = bcrypt.hashSync(adminPassword, 10);

//         const adminUser = new User({
//             username: 'admin2',
//             password: hashedPassword
//         });

//         await adminUser.save();
//         console.log('Admin user created');
//     } else {
//         console.log('Admin user already exists');
//     }
// };

// createAdminUser().then(() => {
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web app is listening on port ${PORT}`);
});
// });
