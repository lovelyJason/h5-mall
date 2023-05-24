<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'  // TODO:不加后缀没识别
import { ref, reactive, onMounted, inject, toRefs } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

const $wxapi: any = inject('$wxapi')
const WXAPI = $wxapi

const searchValue = ref('')
const activeCategory = ref<number>(0)
const secondCategoryId = ref<string>('0')
const page = ref<number>(1)
const pageSize = ref<number>(50)
const scrolltop = ref<number>(0)

const categorySelected = reactive<any>({
  name: '',
  id: ''
})
const firstCategories = reactive<Array<any>>([])
const currentGoods = reactive<Array<any>>([])

const categories = async () => {
  // wx.showLoading({
  //   title: '',
  // })
  const res = await $wxapi.goodsCategory()
  // wx.hideLoading()
  if (res.code == 0) {
    const categories = res.data.filter((ele: any) => {
      return !ele.vopCid1 && !ele.vopCid2
    })
    categories.forEach((p: any) => {
      p.childs = categories.filter((ele: any) => {
        return p.id == ele.pid
      })
    })
    // firstCategories.value = categories.filter((ele: any) => { return ele.level == 1 })
    Object.assign(firstCategories, categories.filter((ele: any) => { return ele.level == 1 }))
    if (categorySelected.id) {
      activeCategory.value = firstCategories.findIndex((ele: any) => {
        return ele.id == categorySelected.id
      })
      Object.assign(categorySelected, firstCategories[activeCategory.value])
    } else {
      Object.assign(categorySelected, firstCategories[0])
    }
    getGoodsList()
  }
}

const getGoodsList = async () => {
  // if (this.data.categoryMod == 2) {
  //   return
  // }
  // wx.showLoading({
  //   title: '',
  // })
  // secondCategoryId
  let categoryId = ''
  if (secondCategoryId.value && secondCategoryId.value != '0') {
    categoryId = secondCategoryId.value
  } else if(categorySelected.id) {
    console.log(2222, categorySelected.id)
    categoryId = categorySelected.id
  }
  // https://www.yuque.com/apifm/nu0f75/wg5t98
  const res = await WXAPI.goodsv2({
    categoryId,
    page: page.value,
    pageSize: pageSize.value
  })
  // wx.hideLoading()
  if (res.code == 700) {
    if (page.value == 1) {
      currentGoods.length = 0
    } else {
      // wx.showToast({
      //   title: '没有更多了',
      //   icon: 'none'
      // })
    }
    return
  }
  if (res.code != 0) {
    // wx.showToast({
    //   title: res.msg,
    //   icon: 'none'
    // })
    return
  }
  if (page.value == 1) {
    Object.assign(currentGoods, res.data.result)
  } else {
    currentGoods.push(...res.data.result)
  }
}

const onCategoryClick = async (e: number) => { // TODO: e的type是什么
  //@ts-ignore
  const idx = e
  if (idx == activeCategory.value) {
    scrolltop.value = 0
    return
  }
  Object.assign(categorySelected, firstCategories[idx])
  page.value = 1
  secondCategoryId.value = ''
  activeCategory.value = idx
  currentGoods.length = 0
  getGoodsList();
}

onMounted(() => {
  categories()
})

</script>

<template>
  <main>
    <van-search v-model="searchValue" placeholder="请输入搜索关键词" />
    <van-row  justify="space-between">
      <van-col class="category-col left" span="6">
        <van-sidebar v-model="activeCategory">
          <!-- 这里$event就是index，好像传递不了事件对象 -->
          <van-sidebar-item @click="onCategoryClick" :data-idx="index"  v-for="(category, index) in firstCategories" :key="category.id"  :title="category.name" />
        </van-sidebar>
      </van-col>
      <van-col class="product-col right" span="16">
        <van-empty v-if="!currentGoods" description="暂无商品" />
        <van-card
          v-for="item in currentGoods"
          :key="item.id"
          num="1"
          :price="item.minPrice"
          :desc="item.numberSells ? '已售' + item.numberSells : ''"
          :title="item.name"
          :thumb="item.pic"
        >
          <template #footer>
            <van-button size="mini" @click="router.push('/to-pay-order')">下单</van-button>
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
.left, .right {
  height: calc(100vh - 120px);
  overflow: auto;
}
</style>
