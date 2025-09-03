import Vue from "vue";
import VueRouter from "vue-router";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import { getToken } from "@/utils/storage.js";
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;
Vue.use(ElementUI);
Vue.use(VueRouter);

const routes = [
  { path: "/", component: () => import(`@/views/user/Home.vue`) },
  { path: "/login", component: () => import(`@/views/login/Login.vue`) },
  { path: "/register", component: () => import(`@/views/register/Register.vue`) },
  {
    path: "/admin",
    component: () => import(`@/views/admin/Home.vue`),
    meta: { requireAuth: true },
    children: [
      { path: "/adminLayout", name: 'Dashboard', icon: 'el-icon-pie-chart', component: () => import(`@/views/admin/Main.vue`), meta: { requireAuth: true } },
      { path: "/userManage", name: 'User Management', icon: 'el-icon-user-solid', component: () => import(`@/views/admin/User.vue`), meta: { requireAuth: true } },
      { path: "/productManage", name: 'Item Management', icon: 'el-icon-shopping-bag-1', component: () => import(`@/views/admin/Product.vue`), meta: { requireAuth: true } },
      { path: "/categoryManage", name: 'Category Management', icon: 'el-icon-document-checked', component: () => import(`@/views/admin/Category.vue`), meta: { requireAuth: true } },
      // { path: "/evaluations", name: 'Comment Management', icon: 'el-icon-chat-dot-round', component: () => import(`@/views/admin/Evaluations.vue`), meta: { requireAuth: true } },
      { path: "/ordersManage", name: 'Order Management', icon: 'el-icon-document-copy', component: () => import(`@/views/admin/Orders.vue`), meta: { requireAuth: true } },
      { path: "/interactionManage", name: 'Interaction Management', icon: 'el-icon-connection', component: () => import(`@/views/admin/Interaction.vue`), meta: { requireAuth: true } },
      { path: "/operationLogManage", name: 'Operation Log Management', icon: 'el-icon-connection', component: () => import(`@/views/admin/OperationLog.vue`), meta: { requireAuth: true } },
      // { path: "/product-detail", name: 'Item Detail', icon: 'el-icon-chat-dot-round', component: () => import(`@/views/admin/ProductDetail.vue`), meta: { requireAuth: true } },
    ]
  },
  {
    path: "/user",
    component: () => import(`@/views/user/Home.vue`),
    meta: { requireAuth: true },
    children: [
      { name: '商品', path: "/product", component: () => import(`@/views/user/Product.vue`), meta: { requireAuth: true } },
      { name: '我的商品', path: "/myProduct", component: () => import(`@/views/user/MyProduct.vue`), meta: { requireAuth: true } },
      { name: '我的收藏', path: "/mySave", component: () => import(`@/views/user/MySave.vue`), meta: { requireAuth: true } },
      { name: '足迹', path: "/myView", component: () => import(`@/views/user/MyView.vue`), meta: { requireAuth: true } },
      { name: '订单', path: "/orders", component: () => import(`@/views/user/Orders.vue`), meta: { requireAuth: true } },
      { name: '消息', path: "/message", component: () => import(`@/views/user/Message.vue`), meta: { requireAuth: true } },
      { name: '个人中心', path: "/myself", component: () => import(`@/views/user/Myself.vue`), meta: { requireAuth: true } },
      { name: '搜索页', path: "/search", show: false, auth: false, component: () => import(`@/views/user/Search.vue`), meta: { requireAuth: true } },
      { name: 'PostProduct', path: "/post-product", component: () => import(`@/views/user/PostProduct.vue`), meta: { requireAuth: true } },
      { name: 'EditProduct', path: "/edit-product", component: () => import(`@/views/user/EditProduct.vue`), meta: { requireAuth: true } },
      { name: 'ProductDetail', path: "/product-detail", component: () => import(`@/views/user/ProductDetail.vue`), meta: { requireAuth: true } },
    ]
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});
router.beforeEach((to, from, next) => {
  if (to.meta.requireAuth) {
    const token = getToken();
    // 需要放行的路由
    const releasePaths = ['/main', '/product'];
    if (releasePaths.includes(to.path)) {
      next();
    } else {
      if (token !== null) {
        next();
      } else {
        next("/login");
      }
    }
  }
  else {
    next();
  }
});
// import 'vue-vibe'
export default router;
