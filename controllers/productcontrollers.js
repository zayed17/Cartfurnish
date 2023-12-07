const Product = require('../models/productmodal')
const Sharp = require('sharp');
const Category = require('../models/categorymodal')




const loadproduct = async (req,res)=>{
    try {
        const products = await Product.find({})
        res.render('product',{products})
    } catch (error) {
        console.log(error);
    }
}
const loadaddproduct = async (req, res) => {
  try {
      // Assuming is_list is a field in your Category model
      const categories = await Category.find({ is_list: true });

      res.render('addproduct', { categories });
  } catch (error) {
      console.log(error);
  }
};



// const addproduct = async (req, res) => {
//     try {
//       const { name, quantity, category, price, description } = req.body;
      
//       // Check if required fields are present
  
//       // Get file information
//       const files = req.files;
//       const imagePaths = [];
  
//       // Process and save each image using Sharp
//       for (const key in files) {
//         if (Object.prototype.hasOwnProperty.call(files, key)) {
//           const image = files[key][0];
//           const imagePath = `public/assets/images/products/original/${image.filename}`;
//           const sharpPath = `public/assets/images/products/sharpened/${image.filename}`;
  
//           await Sharp(image.path).resize(500, 500).toFile(sharpPath);
  
//           imagePaths.push({
//             fieldName: key,
//             originalPath: imagePath,
//             sharpPath: sharpPath,
//           });
//         }
//       }
  
//       // Create a product instance
//       const product = new Product({
//         name,
//         quantity,
//         category: category,
//         price,
//         offer: null,
//         description,
//         images: imagePaths,
//         is_blocked: false,
//       });
  
//       // Save the product to the database
//       await product.save();
  
//       res.redirect('/addproduct');
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Internal Server Error");
//     }
//   };



const addproduct = async (req, res) => {
    try {
      const details = req.body;
      // console.log(details);
      const files = await req.files;
      const img = [
        files.image1[0].filename,
        files.image2[0].filename,
        files.image3[0].filename,
        files.image4[0].filename,
      ];
      for (let i = 0; i < img.length; i++) {
        await Sharp("public/assets/images/products/original/" + img[i])
          .resize(500, 500)
          .toFile("public/assets/images/products/sharpened/" + img[i]);
      }
  
console.log(req.body.quantity);
console.log(req.body.price);

      if (details.quantity > 0 && details.price > 0) {
        const product = new Product({
          name: details.name,
          quantity: details.quantity,
          category: details.category,
          price: details.price,
          offer: details.offer,
          description: details.description,
          "images.image1": files.image1[0].filename,
          "images.image2": files.image2[0].filename,
          "images.image3": files.image3[0].filename,
          "images.image4": files.image4[0].filename,
        });
        // console.log(product);
  
        const result = await product.save();
        console.log(result);
        res.redirect("/admin/product");
      } else {
        // Provide specific error message
        // const errors = 'Stock and price must be greater than 0';
        // res.render("addProduct", { errors, categories });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };


  const loadeditproduct = async(req,res)=>{
    try {
      const productid = req.query.id;
      const productData = await Product.findOne({_id:productid}).populate('category')
      const categoryData = await Category.find({is_list:true})

      res.render('editproduct',{product:productData,category:categoryData})
    } catch (error) {
      console.log();
    }
  }
  

  // const editproduct = as

  module.exports = {
    loadaddproduct,
    addproduct,
    loadproduct,
    loadeditproduct,
    
  }