const Banner = require('../models/bannermodels');
const fs = require('fs');

const laodbanner = async(req,res)=>{
    try {
        const banner = await Banner.find({})
        res.render('banner',{banner})
    } catch (error) {
        console.log(error);
    }
}
const loadaddbanner = async(req,res)=>{
    try {
        res.render('addbanner')
    } catch (error) {
        console.log(error);
    }
}

const addbanner = async(req,res)=>{
    try {
        const data =  new Banner({
            title:req.body.title,
            description:req.body.description,
            image:req.file.originalname,
            targeturl:req.body.targeturl
        })
        await data.save()
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error);
    }
}

const loadeditbanner = async(req,res)=>{
    try {
        const id = req.query.id;
        const data = await Banner.findOne({_id:id})
        res.render('editbanner',{data})
    } catch (error) {
        console.log(error);
    }
}

const editbanner = async (req, res) => {
    try {
        const id = req.query.id;
        const data = await Banner.findOne({ _id: id });

        let image;
        console.log(req.files,req.file,req.file.originalname);

        if (req.file && req.file.originalname) {
            image = req.file.originalname;

            const imagePathOriginal = `public/assets/images/banner/${data.image}`;

            await fs.promises.unlink(imagePathOriginal);
        } else {
            image = data.image;
        }


        console.log(req.body,req.file.originalname)
        await Banner.findOneAndUpdate(
            { _id: id },
            {
                title: req.body.title,
                description: req.body.description,
                targeturl: req.body.targeturl,
                image: image,
            }
        );

        res.redirect('/admin/banner');
    } catch (error) {
        console.error(error);
    }
};

 

module.exports ={
    loadaddbanner,
    addbanner,
    laodbanner,
    loadeditbanner,
    editbanner
}