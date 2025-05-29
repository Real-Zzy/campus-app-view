<template>
    <div class="post-product">
        <div>
            <div>
                <p>Item Name</p>
                <input class="dialog-input" v-model="product.name" placeholder="Item Name" />
            </div>
            <div>
                <p>Item Condition (bigger value means newer)</p>
                <el-input-number v-model="product.oldLevel" :min="1" :max="10" label="Item Condition"></el-input-number>
            </div>
            <div>
                <p>Price</p>
                <input class="dialog-input" v-model="product.price" placeholder="Price" />
            </div>
            <div>
                <p>Discountable?</p>
                <el-switch v-model="product.bargain" active-text="Yes" inactive-text="No">
                </el-switch>
            </div>
            <div>
                <span class="post" @click="editProduct">Edit Item</span>
            </div>
        </div>
        <div>
            <div>
                <p>Images</p>
                <el-upload action="http://localhost:21090/api/campus-product-sys/v1.0/file/upload"
                    list-type="picture-card" :on-success="handlePictureCardSuccess" :file-list="coverList"
                    :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
                    <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogVisible">
                    <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
            </div>
            <div>
                <p>Item Category</p>
                <span :style="{
                    backgroundColor: categorySelected.id === category.id ? 'rgb(76, 147, 209)' : '',
                    color: categorySelected.id === category.id ? 'rgb(244,244,244)' : ''
                }" class="category-item" @click="categoryClick(category)" v-for="(category, index) in categoryList"
                    :key="index">
                    {{ category.name }}
                </span>
            </div>
            <div>
                <p>Quantity</p>
                <el-input-number v-model="product.inventory" :min="1" :max="10000" label="Item Condition"></el-input-number>
            </div>
            <div>
                <Editor height="calc(100vh - 400px)" :receiveContent="product.detail" @on-receive="onReceive" />
            </div>
        </div>
    </div>
</template>
<script>
import Editor from "@/components/Editor"
import { getProductInfo } from "@/utils/storage"
export default {
    components: { Editor },
    name: 'PostProduct',
    data() {
        return {
            product: {},
            categorySelected: {}, // 当前选中的商品类别
            dialogImageUrl: '',
            dialogVisible: false,
            coverList: [],
            categoryList: []
        };
    },
    created() {
        this.getStorageProductInfo();
        this.fetchCategoryList();
    },
    methods: {
        getStorageProductInfo() {
            this.product = getProductInfo();
            this.coverListParse(this.product)
        },
        /**
         * Item Images
         * string to array
         * @param {*} product product info
         */
        coverListParse(product) {
            if (product.coverList === null) {
                return;
            }
            this.coverList = product.coverList.split(',').map(coverEntity => {
                return {
                    uid: Date.now() + Math.floor(Math.random() * 10001),
                    name: Date.now() + Math.floor(Math.random() * 10001),
                    status: 'success',
                    url: coverEntity
                }
            })
        },
        /**
         * edit item information
         */
        editProduct() {
            if (this.product.name === undefined) {
                this.$notify.info({
                    duration: 1000,
                    title: 'Filling Reminder',
                    message: 'Please set item name'
                });
                return;
            }
            if (this.product.price === undefined) {
                this.$notify.info({
                    duration: 1000,
                    title: 'Filling Reminder',
                    message: 'Please set item price'
                });
                return;
            }
            if (this.coverList.length === 0) {
                this.$notify.info({
                    duration: 1000,
                    title: 'Posting Reminder',
                    message: 'Please upload image(s)'
                });
                return;
            }
            const coverUrlList = this.coverList.map(entity => entity.url);
            this.product.coverList = coverUrlList.join(',');
            // handle item cover
            this.$axios.put('/product/update', this.product).then(res => {
                const { data } = res;
                if (data.code === 200) {
                    this.$notify.success({
                        title: 'Update Operation',
                        message: data.msg
                    });
                    // navigate to myProduct page
                    this.$router.push('/myProduct');
                }
            }).catch(error => {
                this.$notify.error({
                    title: 'Update Operation',
                    message: error
                });
                console.log("Product Category Query Error:", error);
            });
        },
        /**
         * editor callback
         * @param {*} detail 
         */
        onReceive(detail) {
            this.product.detail = detail;
        },
        /**
         * category click event
         * @param {*} category 商品分类
         */
        categoryClick(category) {
            this.categorySelected = category;
            this.product.categoryId = category.id;
        },
        /**
         * query item category
         */
        fetchCategoryList() {
            this.$axios.post('/category/query', {}).then(res => {
                const { data } = res;
                if (data.code === 200) {
                    this.categoryList = data.data;
                    // first category got selected by default
                    this.categoryClick(this.categoryList[0]);
                }
            }).catch(error => {
                console.log("category query error:", error);
            });
        },
        /**
         * handle image upload success
         * @param {*} file 
         * @param {*} fileList 
         */
        handlePictureCardSuccess(file, fileList) {
            this.coverList.push({
                uid: Date.now() + Math.floor(Math.random() * 10001),
                name: Date.now() + Math.floor(Math.random() * 10001),
                status: 'success',
                url: file.data
            });
        },
        handleRemove(file, fileList) {
            this.coverList = fileList
            console.log(file, fileList);
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        }
    }
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