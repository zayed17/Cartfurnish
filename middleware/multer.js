const multer=require('multer');

const productStorage = multer.diskStorage({
    destination: "public/assets/images/products/sharpened",
    filename:(req,file,cb)=>{
        const filename = file.originalname;
        cb(null,filename)
    }
})

const BannerStorage = multer.diskStorage({
    destination: "public/assets/images/banner",

    filename:(req,file,cb)=>{
        const filename = file.originalname;
        cb(null,filename)
    }
})



const products = multer({ storage:productStorage});
const uploadproduct =products.array('cropedImages', 4)
const uploadBanner = multer({ storage:BannerStorage})

module.exports = {
    uploadproduct,
    uploadBanner
}

