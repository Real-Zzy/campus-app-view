<template>
    <div class="detail-container">
        <div class="cover">
            <div>
                <div :style="{
                    border: coverIndex === index ? '1px solid rgb(51,51,51)' : ''
                }" @click="coverSelected(coverItem, index)" class="cover-item" v-for="(coverItem, index) in coverList"
                    :key="index">
                    <img :src="coverItem" alt="" srcset="">
                </div>
            </div>
            <div class="large-cover">
                <div>
                    <i @click="coverToLeft" class="el-icon-arrow-left"></i>
                </div>
                <img :src="coverItem" alt="" srcset="">
                <div>
                    <i @click="coverToRight" class="el-icon-arrow-right"></i>
                </div>
            </div>
        </div>
        <div class="info">
            <div class="decimal">
                <span class="price"><span class="symbol">$</span>{{ product.price }}</span>
                <span style="border: 2px solid rgb(214, 214, 214);border-radius: 50%;"></span>
                <span>{{ product.categoryName }}</span>
                <span style="border: 2px solid rgb(214, 214, 214);border-radius: 50%;"></span>
                <img :src="product.userAvatar" style="width: 20px;height: 20px;border-radius: 50%;" alt="" srcset="">
                <span>{{ product.userName }}</span>
                <!-- <span class="bargain">{{ product.bargain ? 'Discountable' : 'Undiscountable' }}</span> -->
                <div v-if="product.bargain">
                    <span class="bargain">Discountable</span>
                </div>
                
            </div>
            <div class="decimal">
                <!-- <span>{{ product.oldLevel }}成新</span> -->
                <span>{{ 10 - product.oldLevel }}0% Used</span>
                <span style="border: 2px solid rgb(214, 214, 214);border-radius: 50%;"></span>
                <span>Quantity&nbsp;{{ product.inventory }}</span>
            </div>
            <div class="name">
                {{ product.name }}
            </div>
            <div>
                <div v-html="product.detail"></div>
            </div>
            <div class="operation">
                <div class="left">
                    <span @click="likeProduct"><i class="el-icon-sell" style="margin-right: 5px;"></i>Notify Seller</span>
                    <span @click="buyProduct">Order</span>
                </div>
                <div class="right">
                    <span @click="saveOperation"><i style="margin-right: 5px;" class="el-icon-star-off"></i>{{ saveFlag ? 'Remove From Favorite' : 'Add To Favorite' }}</span>
                </div>
            </div>
        </div>
        <el-dialog :show-close="false" :visible.sync="dialogProductOperaion" width="35%">
            <div style="padding:16px 20px;">
                <p>Order</p>
                <div class="info">
                    <div class="decimal">
                        <span class="price"><span class="symbol">￥</span>{{ product.price }}</span>
                        <span style="border: 2px solid rgb(214, 214, 214);border-radius: 50%;"></span>
                        <span>{{ product.categoryName }}</span>
                        <span style="border: 2px solid rgb(214, 214, 214);border-radius: 50%;"></span>
                        <img :src="product.userAvatar" style="width: 20px;height: 20px;border-radius: 50%;" alt=""
                            srcset="">
                        <span>{{ product.userName }}</span>
                        <!-- <span class="bargain">{{ product.isBargain ? '可砍价' : '不支持砍价' }}</span> -->
                        <div v-if="product.bargain">
                            <span class="bargain">Discountable</span>
                        </div>
                    </div>
                    <div class="decimal">
                        <!-- <span>{{ product.oldLevel }}成新</span> -->
                        <span>{{ 10 - product.oldLevel }}0% Used</span>
                        <span style="border: 2px solid rgb(214, 214, 214);border-radius: 50%;"></span>
                        <span>Quantity&nbsp;{{ product.inventory }}</span>
                    </div>
                    <div class="name">
                        {{ product.name }}
                    </div>
                </div>
                <div>
                    <p>Order Quantity</p>
                    <el-input-number v-model="buyNumber" :min="1" :max="product.inventory"
                        label="Set Quantity"></el-input-number>
                </div>
                <div>
                    <p>Notes</p>
                    <el-input type="textarea" :rows="3" placeholder="add notes" v-model="detail">
                    </el-input>
                </div>
            </div>
            <span slot="footer" class="dialog-footer" style="margin-top: 10px;">
                <span class="channel-button" @click="cannelBuy()">
                    取消下单
                </span>
                <span class="edit-button" @click="buyConfirm()">
                    确定下单
                </span>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: 'ProductDetail',
    data() {
        return {
            productId: null,
            product: {},
            coverList: [],
            coverIndex: 0,
            coverItem: null,
            keyInterval: null,
            saveFlag: false, // whether added to favorite or not
            dialogProductOperaion: false,
            buyNumber: 1,
            detail: ''
        }
    },
    created() {
        this.getParam();
    },
    beforeDestroy() {
        this.clearBanner(); // 清除定时器
    },
    methods: {
        /**
         * 商品下单
         */
        buyConfirm() {
            const ordersDTO = {
                productId: this.product.id,
                buyNumber: this.buyNumber,
                detail: this.detail
            }
            this.$axios.post(`/product/buyProduct`, ordersDTO).then(res => {
                const { data } = res; // 解构
                if (data.code === 200) {
                    this.$notify({
                        duration: 1000,
                        title: 'Order Operation',
                        message: data.msg,
                        type: 'success'
                    });
                    this.fetchProduct(this.product.id);
                    this.cannelBuy();
                } else {
                    this.$notify({
                        duration: 2000,
                        title: 'Order Operation',
                        message: data.msg,
                        type: 'error'
                    });
                }
            }).catch(error => {
                this.$notify({
                    duration: 2000,
                    title: 'Order Operation',
                    message: error,
                    type: 'error'
                });
                console.log("商品下单异常：", error);
            })
        },
        cannelBuy() {
            this.dialogProductOperaion = false;
            this.buyNumber = 1;
        },
        buyProduct() {
            this.dialogProductOperaion = true;
        },
        likeProduct(){
            this.$axios.post(`/interaction/likeProduct/${this.product.id}`).then(res => {
                const { data } = res; // 解构
                if (data.code === 200) {
                    this.$notify({
                        duration: 1000,
                        title: 'Notification Sending Operation',
                        message: data.msg,
                        type: 'success'
                    });
                }else{
                    this.$notify({
                        duration: 2000,
                        title: 'Notification Sending Operation',
                        message: data.msg,
                        type: 'info'
                    });
                }
            }).catch(error => {
                console.log("item wanted-notification error：", error);
            })
        },
        querySaveStatus() {
            // 判断用户是否已经登录
            const userInfo = getUserInfo();
            if (userInfo === null) { // 没登录不用查
                console.log("user not logged in");
                return;
            }
            const interactionQueryDto = {
                userId: userInfo.id,
                productId: this.product.id,
                type: 1 // 1代表的是收藏行为
            };
            this.$axios.post('/interaction/query', interactionQueryDto).then(res => {
                const { data } = res; // 解构
                if (data.code === 200) {
                    // 代表没有收藏
                    this.saveFlag = data.total !== 0;
                }
            }).catch(error => {
                console.log("item query error：", error);
            })
        },
        /**
         * 收藏操作 （收藏跟取消收藏是一组对立的操作）
         */
        saveOperation() {
            this.$axios.post(`/interaction/saveOperation/${this.product.id}`).then(res => {
                const { data } = res; // 解构
                if (data.code === 200) {
                    // 代表没有收藏
                    this.saveFlag = data.data;
                    this.$notify({
                        duration: 1000,
                        title: 'Favorite Operation',
                        message: data.msg,
                        type: 'success'
                    });
                }
            }).catch(error => {
                console.log("item query error：", error);
            })
        },
        clearBanner() {
            if (this.keyInterval) {
                clearInterval(this.keyInterval);
                this.keyInterval = null; // 重置定时器引用
            }
        },
        startBanner() {
            this.keyInterval = setInterval(() => {
                if (this.coverIndex === this.coverList.length - 1) {
                    this.coverIndex = 0;
                } else {
                    this.coverIndex = this.coverIndex + 1;
                }
                this.coverItem = this.coverList[this.coverIndex];
            }, 5000);
        },
        coverToLeft() {
            if (this.coverIndex === 0) {
                this.coverIndex = this.coverList.length - 1;
            } else {
                this.coverIndex = this.coverIndex - 1;
            }
            this.coverItem = this.coverList[this.coverIndex];
        },
        coverToRight() {
            if (this.coverIndex === this.coverList.length - 1) {
                this.coverIndex = 0;
            } else {
                this.coverIndex = this.coverIndex + 1;
            }
            this.coverItem = this.coverList[this.coverIndex];
        },
        coverSelected(coverItem, index) {
            this.coverItem = coverItem;
            this.coverIndex = index;
        },
        /**
         * 从路径上取得商品ID
         */
        getParam() {
            const param = this.$route.query;
            this.productId = Number(param.productId);
            this.fetchProduct(this.productId);
        },
        coverListParse(product) {
            if (product.coverList === null) {
                return;
            }
            this.coverList = product.coverList.split(',');
            // 默认选中第一张封面
            this.coverItem = this.coverList[0];
            // 启动定时器，定时轮播
            this.startBanner();
        },
        fetchProduct(productId) {
            this.$axios.post('/product/query', { id: productId }).then(res => {
                const { data } = res; // 解构
                if (data.code === 200) {
                    this.product = data.data[0];
                    this.coverListParse(this.product);
                }
            }).catch(error => {
                console.log("item query error：", error);
            })
        },
    }
};
</script>
<style scoped lang="scss">
.info {
    width: 500px;

    .operation {
        display: flex;
        justify-content: left;
        gap: 20px;
        font-size: 14px;
        cursor: pointer;

        .right{
            span:hover{
                background-color: rgb(241,241,241);    
            }
            span {
                display: inline-block;
                width: 168px;
                text-align: center;
                background-color: rgb(246,246,246);
                border-radius: 20px;
                
            }
        }

        .left {
            display: flex;
            justify-content: space-evenly;

            span {
                display: inline-block;
                width: 160px;
                text-align: center;
            }

            span:first-child {
                background-color: rgb(255, 230, 15);
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
            }

            span:last-child {
                background-color: rgb(59, 59, 59);
                color: rgb(245,245,245);
                border-top-right-radius: 20px;
                border-bottom-right-radius: 20px;
            }
        }

        div {
            line-height: 40px;
        }
    }

    .name {
        margin-block: 10px;
        font-size: 24px;
    }

    .decimal {
        display: flex;
        justify-content: left;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        margin-block: 6px;

        .price {
            .symbol {
                font-size: 16px;
            }

            font-size: 32px;
            font-weight: 800;
            color: rgb(255, 68, 0);
        }

        .bargain {
            font-size: 10px;
            color: rgb(51, 51, 51);
            background-color: rgb(246, 228, 24);
            padding: 2px 4px;
            border-radius: 5px;
        }
    }

}

.detail-container {
    display: flex;
    justify-content: left;

    .cover {
        display: flex;
        justify-content: left;

        .large-cover {
            padding: 6px;
            margin: 10px;
            display: flex;
            justify-content: left;
            align-items: center;
            gap: 40px;

            i:hover {
                background-color: rgb(246, 246, 246);
            }

            i {
                display: inline-block;
                padding: 20px;
                border-radius: 50%;
                font-size: 20px;
                font-weight: 800;
                cursor: pointer;
            }

            img {
                // width: 280px;
                // height: 280px;
                width: 280px;
                max-height: 280px;
                object-fit: contain;
            }
        }

        .cover-item:hover {
            border: 1px solid rgb(51, 51, 51);
        }

        .cover-item {
            padding: 6px;
            margin: 10px;
            border: 1px solid rgb(255, 255, 255);
            border-radius: 5px;
            transition: all .5s;

            img {
                width: 80px;
                height: 80px;
            }
        }
    }
}
</style>