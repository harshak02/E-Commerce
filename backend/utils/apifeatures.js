class ApiFeatures{
    constructor(query,queryStr){
        this.query = query;// the query like product.find();
        this.queryStr = queryStr;// everything after the ? in params

    }

    search(){
        //only keyword attr is needed
        const keyword = this.queryStr.keyword ? {
            name : {
                $regex : this.queryStr.keyword,//prefix search  like samosa also searches for samosamosa
                $options : "i",//case insensitive
            }
        } : {};

        //query -> here we are accesing from argument and the ...keyword -> regex generated regex
        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr}//passing a copy not by refernece

        //removing some fields for catogerizing from queryStr copy
        const removeFields = ["keyword","page","limit"];
        removeFields.forEach(key=>delete queryCopy[key])

        //filter for pricing and rating (flexibke range logic)
        let queryStr = JSON.stringify(queryCopy);//to string
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key =>`$${key}`);

        //stroing back the value in query and sending back
        this.query = this.query.find(JSON.parse(queryStr));//back to object
        return this;
    }

    pagination(resultPerPage){
        //page is an attr so we can access
        const currPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currPage-1) // skipping that many products

        this.query = this.query.limit(resultPerPage).skip(skip); // inbuilt functions
        return this;
    }
}

module.exports = ApiFeatures;