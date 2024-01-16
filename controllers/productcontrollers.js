const Product = require('../models/productmodal')
const Sharp = require('sharp');
const Category = require('../models/categorymodal')




const loadproduct = async (req,res)=>{
    try {
        const products = await Product.find({}).populate('categoryId')
        res.render('product',{products})
    } catch (error) {
        console.log(error);
    }
}
const loadaddproduct = async (req, res) => {
  try {
      // Assuming is_list is a field in your Category model
      const categoryData = await Category.find({is_list:true})

      res.render('addproduct', { category:categoryData });
  } catch (error) {
      console.log(error);
  }
};




const addproduct = async (req, res) => {
    try {
      const details = req.body;
      // console.log(details);
      const files = await req.files;
      console.log(files, "kitto");
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
          categoryId: details.category,
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
      console.log("heello");
      const productid = req.query.id;
      console.log("1");
      const productData = await Product.findOne({_id:productid}).populate('categoryId')
      console.log("2");
      const categoryData = await Category.find({is_list:true})
      console.log("3");
      res.render('editproduct',{product:productData,category:categoryData})
    } catch (error) {
      console.log(error);
    }
  }
  

  const editproduct = async (req, res) => {
    try {
      console.log("hi");
      const id = req.query.id;
      const details = req.body;
      const files = req.files;
      console.log(id);
      console.log(details);
      console.log(files);
  
      const existingData = await Product.findOne({ _id: id });
  
      const img = [
        files?.image1 ? (files.image1[0]?.filename || existingData.images.image1) : existingData.images.image1,
        files?.image2 ? (files.image2[0]?.filename || existingData.images.image2) : existingData.images.image2,
        files?.image3 ? (files.image3[0]?.filename || existingData.images.image3) : existingData.images.image3,
        files?.image4 ? (files.image4[0]?.filename || existingData.images.image4) : existingData.images.image4,
      ];
  
      for (let i = 0; i < img.length; i++) {
        if (img[i]) {
          await Sharp("public/assets/images/products/original/" + img[i])
            .resize(500, 500)
            .toFile("public/assets/images/products/sharpened/" + img[i]);
        }
      }
  
      if (details.quantity > 0 && details.price > 0) {
        const product = {
          name: details.name,
          quantity: details.quantity,
          categoryId: details.category,
          price: details.price,
          offer: details.offer,
          description: details.description,
          images: {
          image1: img[0],
          image2: img[1],
          image3: img[2],
          image4: img[3],
          },
        };
  
       await Product.findOneAndUpdate({ _id: id }, product, { new: true });
        res.redirect('/admin/product');
      }
    } catch (error) {
      console.log(error.message);
      console.log(error);
    }
  };
  
  const blockProducts=async(req,res)=>{
    try {
      const user = req.params.id; 
      const userValue = await Product.findOne({ _id: user });
      if (userValue.is_blocked) {
        await Product.updateOne({ _id: user }, { $set: { is_blocked: false } });
      } else {
        await Product.updateOne({ _id: user }, { $set: { is_blocked: true } });
      }
      res.json({ block: true });
    } catch (error) {
      console.log(error.message);
    }
  }


  module.exports = {
    loadaddproduct,
    addproduct,
    loadproduct,
    loadeditproduct,
    blockProducts,
    editproduct
  }