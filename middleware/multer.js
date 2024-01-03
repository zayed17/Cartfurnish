const multer=require('multer');

const productStorage = multer.diskStorage({
    destination: "public/assets/images/products/original",

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
const uploadproduct = products.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
])
const uploadBanner = multer({ storage:BannerStorage})

module.exports = {
    uploadproduct,
    uploadBanner
}