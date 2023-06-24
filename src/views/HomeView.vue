<script setup lang="ts">
import Tabbar from '@/components/Tabbar.vue'
import wx from '@/lib/wx';
import { ref, reactive, onMounted, inject, toRefs } from 'vue'
import { useRouter } from 'vue-router';
import { showFailToast } from 'vant';

export interface GoodsListReq {
  categoryId?: string
  page?: string
  pageSize?: string
  nameLike?: string // 商品标题模糊搜索
  tagsLike?: string
  k?: string // 分词联想
}

const router = useRouter()

const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI

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
const data = reactive<any>({
  banners: []
})

const categories = async () => {
  // wx.showLoading({
  //   title: '',
  // })
  const res = await $WEBAPI.goodsCategory()
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

const getGoodsList = async (req?: any) => {
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
    categoryId = categorySelected.id
  }
  // https://www.yuque.com/apifm/nu0f75/wg5t98
  const res = await WEBAPI.goodsv2({
    categoryId,
    page: page.value,
    pageSize: pageSize.value,
    ...req
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

const resetGoodsList = () => {
  page.value = 1
  secondCategoryId.value = ''
  currentGoods.length = 0
}

const onCategoryClick = async (e: number) => {
  //@ts-ignore
  const idx = e
  if (idx == activeCategory.value) {
    scrolltop.value = 0
    return
  }
  resetGoodsList()
  Object.assign(categorySelected, firstCategories[idx])
  activeCategory.value = idx

  getGoodsList({ k: searchValue.value });
}

const gotoOrderPage = (e: any, id: number | string, logisticsId: number) => {
  e.stopPropagation();
  router.push(`/to-pay-order?id=${id}&mod=${logisticsId > 0 ? '1' : '0'}`)
  // TODO:给入口关注公众号

}

const onSearchClear = () => {
  getGoodsList()
}

const searchGoodes = () => {
  // resetGoodsList()
  getGoodsList({k: searchValue.value})
}

const gotoGoodsDetail = (e: any ,id: string | number) => {
  e.stopPropagation();
  router.push('/goods-detail?id=' + id)
}

const getBanners = async () => {
  const res = await WEBAPI.banners({
    type: 'index'
  })
  if (res.code == 700) {
    showFailToast('请在后台添加 banner 轮播图片，自定义类型填写 index')
  } else {
    data.banners = res.data
  }
}

onMounted(() => {
  getBanners()
  categories()
})

</script>
<template>
  <main>
    <div class="swiper-container">
      <van-swipe class="my-swipe swiper1" :autoplay="6000" indicator-color="white">
        <van-swipe-item v-for="item in data.banners" :key="item.id">
          <img mode="aspectFill" bindtap="tapBanner" :data-url="item.linkUrl" :src="item.picUrl" />
        </van-swipe-item> 
      </van-swipe>
    </div>
    <van-search @clear="onSearchClear" clearable @search="searchGoodes" v-model="searchValue" placeholder="请输入搜索关键词" />
    <van-row  justify="space-between">
      <van-col class="category-col left" style="box-shadow: 3px 3px 2px rgba(0, 0, 0, 0.02), 6px 6px 5px rgba(0, 0, 0, 0.028), 12px 12px 10px rgba(0, 0, 0, 0.035), 22px 22px 18px rgba(0, 0, 0, 0.042), 41px 41px 33px rgba(0, 0, 0, 0.05), 100px 100px 80px rgba(0, 0, 0, 0.07);">
        <van-sidebar v-model="activeCategory">
          <!-- 这里$event就是index，好像传递不了事件对象 -->
          <van-sidebar-item @click="onCategoryClick" :data-idx="index"  v-for="(category, index) in firstCategories" :key="category.id"  :title="category.name" />
        </van-sidebar>
      </van-col>
      <van-col class="product-col right" span="16">
        <van-empty v-if="!currentGoods.length" description="暂无商品" />
        <van-card
          style="border-radius: 6px;"
          @click="gotoGoodsDetail($event, item.id)"
          v-for="item in currentGoods"
          :key="item.id"
          num="1"
          :price="$filters.numFormat(item.minPrice)"
          :desc="item.numberSells ? '已售' + item.numberSells : ''"
          :title="item.name"
          :thumb="item.pic"
        >
          <template #footer>
            <van-divider style="margin: 8px 0;" />
            <div @click="gotoOrderPage($event, item.id, item.logisticsId)" class="prod-card-footer-order">
              <span>立即下单</span>
              <!-- <van-button plain hairline type="primary" size="large" @click="gotoOrderPage(item.id)">下单</van-button> -->
            </div>
          </template>
        </van-card>
      </van-col>
    </van-row>
    <Tabbar />
  </main>
</template>

<style scoped lang="scss">
main {
  /* background-color: #ccc; */
  padding: 1rem 0.8rem 0;
  .van-sidebar {
    width: 100%;
  }
  .swiper-container {
    width: 100%;
    // height: 375rpx;
    height: convertRpxToVw(220);
    position: relative;
    z-index: 1;
    .swiper1 {
      width: 100%;
      height: convertRpxToVw(220);
      img {
        width: 100%;
        height: convertRpxToVw(220);
        object-fit: cover;
      }
    }
  }
}
.product-col {
  padding-top: 12px;
  padding-bottom: 50px;
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
  height: calc(100vh - 50px - 29.3vw - 1rem - 54px); // 上面增加了内容这里要缩短否则滚动条出现
  overflow: auto;
}
.prod-card-footer-order {
  // margin-top: var(--van-card-padding);   // 无效？
  text-align: center;
  height: 28px;
  line-height: 28px;
  > span {
    color: #00C4FF;
  }

  // .van-button {
  //   height: 32px;
  //   margin-left: 0;
  //   border-radius: 18px;
  //   border: var(--van-border-width) solid var(--van-button-primary-border-color);
  //   &::before, &::after {
  //     border: none;
  //   }
  // }
}
</style>
