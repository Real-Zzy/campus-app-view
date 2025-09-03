<template>
  <div class="post-product">
    <div>
      <div>
        <p>Item Name</p>
        <input
          class="dialog-input"
          v-model="product.name"
          placeholder="item name"
        />
      </div>
      <div>
        <p>Item Condition (bigger value means newer)</p>
        <el-input-number
          v-model="oldLevel"
          @change="handleChange"
          :min="1"
          :max="10"
          label="Item Condition"
        ></el-input-number>
      </div>
      <div>
        <p>Price</p>
        <input
          class="dialog-input"
          type="number"
          v-model="product.price"
          placeholder="price"
        />
      </div>
      <div>
        <p>Discountable?</p>
        <el-switch
          v-model="product.bargain"
          active-text="Yes"
          inactive-text="No"
        >
        </el-switch>
      </div>
      <div>
        <span class="post" @click="postProduct">Post Item</span>
      </div>
    </div>
    <div>
      <div>
        <p>Images</p>
        <el-upload
          action="http://localhost:21090/api/campus-product-sys/v1.0/file/upload"
          list-type="picture-card"
          :on-success="handlePictureCardSuccess"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
        <!-- <el-upload
          action="http://52.3.1.205:21090/api/campus-product-sys/v1.0/file/upload"
          list-type="picture-card"
          :on-success="handlePictureCardSuccess"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        > -->
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </div>
      <div>
        <p>Item Category</p>
        <span
          :style="{
            backgroundColor:
              categorySelected.id === category.id ? 'rgb(76, 147, 209)' : '',
            color:
              categorySelected.id === category.id ? 'rgb(244,244,244)' : '',
          }"
          class="category-item"
          @click="categoryClick(category)"
          v-for="(category, index) in categoryList"
          :key="index"
        >
          {{ category.name }}
        </span>
      </div>
      <div>
        <p>Quantity</p>
        <el-input-number
          v-model="inventory"
          @change="handleInventoryChange"
          :min="1"
          :max="10000"
          label="Inventory Quantity"
        ></el-input-number>
      </div>
      <div>
        <Editor
          height="calc(100vh - 400px)"
          :receiveContent="product.detail"
          @on-receive="onReceive"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Editor from "@/components/Editor";
export default {
  components: { Editor },
  name: "PostProduct",
  data() {
    return {
      oldLevel: 9, // 默认九成新
      inventory: 1, // 默认库存
      product: {},
      categorySelected: {}, // 当前选中的商品类别
      dialogImageUrl: "",
      dialogVisible: false,
      coverList: [],
      categoryList: [],
    };
  },
  created() {
    this.fetchCategoryList();
  },
  methods: {
    /**
     * 发布商品
     */
    postProduct() {
      if (this.product.name === undefined) {
        this.$notify.info({
          duration: 1000,
          title: "Filling Reminder",
          message: "Please set item name",
        });
        return;
      }
      if (this.product.price === undefined) {
        this.$notify.info({
          duration: 1000,
          title: "Filling Reminder",
          message: "Please set price",
        });
        return;
      }
      if (this.coverList.length === 0) {
        this.$notify.info({
          duration: 1000,
          title: "Posting Reminder",
          message: "Please upload image(s)",
        });
        return;
      }
      this.product.coverList = this.coverList.join(",");
      // 商品封面需要处理
      this.$axios
        .post("/product/save", this.product)
        .then((res) => {
          const { data } = res;
          if (data.code === 200) {
            this.$notify.success({
              title: "post item",
              message: data.msg,
            });
            // 后续清除之后，跳转我的商品页面
            // this.product = {};
          }
        })
        .catch((error) => {
          this.$notify.error({
            title: "post item",
            message: error,
          });
          console.log("post item error:", error);
        });
    },
    /**
     * 富文本编辑器回调内容
     * @param {*} detail
     */
    onReceive(detail) {
      this.product.detail = detail;
    },
    /**
     * 商品分类选中事件
     * @param {*} category 商品分类
     */
    categoryClick(category) {
      this.categorySelected = category;
      this.product.categoryId = category.id;
    },
    /**
     * 查询商品类别
     */
    fetchCategoryList() {
      this.$axios
        .post("/category/query", {})
        .then((res) => {
          const { data } = res;
          console.log("fetch category list:", data)
          if (data.code === 200) {
            this.categoryList = data.data;
            // 默认选中第一项
            this.categoryClick(this.categoryList[0]);
          }
        })
        .catch((error) => {
          console.log("category query error:", error);
        });
    },
    /**
     * 新旧程度选择事件
     */
    handleChange() {
      console.log("Condition：", this.oldLevel);
      this.product.oldLevel = this.oldLevel;
    },
    /**
     * 库存设置事件
     */
    handleInventoryChange() {
      console.log("Quantity：", this.inventory);
      this.product.inventory = this.inventory;
    },
    /**
     * 封面上传成功响应事件
     * @param {*} file
     * @param {*} fileList
     */
    handlePictureCardSuccess(response, file, fileList) {
      this.coverList.push(response.data);
      console.log("response:", response);
      console.log("file:", file);
      console.log("fileList", fileList);
      console.log("coverList", this.coverList);
      console.log("number of images:", fileList.length)
    },
    // handleRemove(file, fileList) {
    //   this.coverList = fileList;
    //   console.log(file, fileList);
    //   console.log(fileList.length)
    // },
    handleRemove(file, fileList) {
        // Update your internal list of image URLs or file references
        // this.coverList = fileList.map(item => item.url || item.response?.data || item.data);
        this.coverList = fileList.map(item => {
            return (item.response && item.response.data) || item.url || item.data;
        });


        // Log debug info
        console.log("Removed file:", file);
        console.log("Updated fileList:", fileList);
        console.log("Number of remaining images:", this.coverList.length);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
  },
};
</script>
<style scoped lang="scss">
.post {
  display: inline-block;
  background-color: rgb(51, 51, 51);
  margin-block: 30px;
  width: 100%;
  text-align: center;
  padding: 15px;
  box-sizing: border-box;
  color: rgb(245, 245, 245);
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.post:hover {
  background-color: rgb(31, 31, 31);
}

.category-item {
  display: inline-block;
  padding: 6px 20px;
  background-color: rgb(246, 246, 246);
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin: 4px;
}

.category-item:hover {
  background-color: rgb(241, 241, 241);
}

.post-product {
  display: flex;
  justify-content: left;
  gap: 30px;
}
</style>