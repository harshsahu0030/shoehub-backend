class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            {
              title: {
                $regex: this.queryStr.keyword,
                $options: "i",
              },
            },
            {
              brand: {
                $regex: this.queryStr.keyword,
                $options: "i",
              },
            },
            {
              category: {
                $regex: this.queryStr.keyword,
                $options: "i",
              },
            },
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  multiFilters() {
    const category = this.queryStr.category
      ? {
          category: {
            $in: this.queryStr.category.split(","),
            $regex: this.queryStr.category,
            $options: "i",
          },
        }
      : {};

    const brand = this.queryStr.brand
      ? {
          brand: {
            $in: this.queryStr.brand.split(","),
            $regex: this.queryStr.brand,
            $options: "i",
          },
        }
      : {};

    const color = this.queryStr.color
      ? {
          "color.name": {
            $in: this.queryStr.color.split(","),
            $regex: this.queryStr.color,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...category, ...brand, ...color });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Removing some fields for category
    const removeFields = [
      "keyword",
      "page",
      "brand",
      "limit",
      "category",
      "color",
      "sort",
      "limit",
    ];

    // filter for category / type / gender
    removeFields.forEach((key) => delete queryCopy[key]);

    // Filter For Price and Rating
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

export default ApiFeatures;
