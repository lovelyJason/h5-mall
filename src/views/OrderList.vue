<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'  // TODO:不加后缀没识别
import { ref, onMounted } from 'vue'

</script>

<template>
  <div class="order-list">
    <div class="order-item">
      <van-cell title="230521233195190002" value="待支付" size="large" />
      <div class="goods-img-container">
        <div class="img-box"></div>
      </div>
      <div class="goods-price">共 1 件商品 合计：<span class="price">¥ 139</span></div>
      <div class="goods-info">
        <div class="goods-des">
          2023-05-21 23:31:06 
        </div>
      </div>
    </div>
    <div class="order-item">
      <van-cell title="230521233195190002" value="待支付" size="large" />
      <div class="goods-img-container">
        <div class="img-box"></div>
      </div>
      <div class="goods-price">共 1 件商品 合计：<span class="price">¥ 139</span></div>
      <div class="goods-info">
        <div class="goods-des">
          2023-05-21 23:31:06 
        </div>
      </div>
    </div>
    
    <Tabbar />
  </div>
  
</template>

<style scoped>
.order-list {
  padding-top: 20px;
}
.order-item {
  width: 100%;
  background-color: #fff;
  margin-bottom: 20px;
  overflow: hidden;
  /* 解决垂直下边距塌陷 */
}
.goods-img-container {
  margin-left: 16px;
  border-top: 1px solid #eee;
  padding: 30px 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.img-box {
  /* TODO:自适应 */
  width: 50px;
  height: 50px;
  overflow: hidden;
  margin-right: 20px;
  background-color: #f7f7f7;
  display: inline-block;
}
.goods-price {
  width: 96%;
  font-size: 14px;
  text-align: right;
  margin-bottom: 10px;
}
.price {
  font-size: 16px;
  color: #e64340;
}
.goods-info {
  width: 96%;
  margin-left: 4%;
  border-top: 1px solid #eee;
  padding: 4% 0;
  display: flex;
  align-items: center;
}
.goods-des {
  font-size: 3%;
  color: #000000;
}
</style>