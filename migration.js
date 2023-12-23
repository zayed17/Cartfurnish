const mongoose = require('mongoose');
const Product = require('./models/productmodal');
const Category = require('./models/categorymodal');

async function updateProductCategoryIds() {
    try {
        // Connect to the database
        await mongoose.connect('mongodb://127.0.0.1:27017/furni', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Fetch all products
        const products = await Product.find();

        // Fetch all categories
            const categories = await Category.find({}, '_id name');

        // Update product categoryIds
        for (const product of products) {
            const category = categories.find((c) => c.name === product.category);

            if (category) {
                console.log(`Updating product ${product.name} (id: ${product._id}) with categoryId: ${category._id}`);
                product.categoryId = category._id;

                try {
                    await product.save();
                    console.log(`Product ${product.name} (id: ${product._id}) updated successfully.`);
                } catch (error) {
                    console.error(`Error updating product ${product.name} (id: ${product._id}):`, error);
                }
            } else {
                console.log(`Category not found for product ${product.name} (id: ${product._id}), skipping.`);
            }
        }

        console.log('Product categoryIds update successful.');

    } catch (error) {
        console.error('Product categoryIds update failed:', error);

    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
}

// Run the migration
updateProductCategoryIds();
