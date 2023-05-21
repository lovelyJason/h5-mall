<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'  // TODO:不加后缀没识别
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const searchValue = ref('')
const currentCategory = ref(0)


</script>

<template>
  <main>
    <van-search v-model="searchValue" placeholder="请输入搜索关键词" />
    <van-row style="height: calc(100vh - 120px);" justify="space-between">
      <van-col class="category-col" span="6">
        <van-sidebar v-model="currentCategory">
          <van-sidebar-item title="号卡" />
          <van-sidebar-item title="流量" />
        </van-sidebar>
      </van-col>
      <van-col class="product-col" span="16">
        <van-card
          num="1"
          price="2.00"
          desc="描述信息"
          title="商品标题"
          thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
        >
          <template #footer>
            <van-button size="mini">下单</van-button>
          </template>
        </van-card>
        <van-card
          num="1"
          price="2.00"
          desc="描述信息"
          title="商品标题"
          thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
        >
          <template #footer>
            <van-button size="mini">下单</van-button>
          </template>
        </van-card>
        <van-card
          num="1"
          price="2.00"
          desc="描述信息"
          title="商品标题"
          thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
        >
          <template #footer>
            <van-button size="mini">下单</van-button>
          </template>
        </van-card>
      </van-col>
    </van-row>
    <Tabbar />
  </main>
</template>

<style scoped>
main {
  /* background-color: #ccc; */
  padding: 1rem;
}
.category-col, .product-col {
  /* background-color: #fff; */
}
.category-col {
  box-shadow:
  2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02),
  6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028),
  12.5px 12.5px 10px rgba(0, 0, 0, 0.035),
  22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042),
  41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05),
  100px 100px 80px rgba(0, 0, 0, 0.07)
;
}
</style>
