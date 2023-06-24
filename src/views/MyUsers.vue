<script setup lang="ts">
import { ref, reactive, onMounted, inject } from 'vue'
import { useUserStore } from '@/stores/user';
import { showLoadingToast, showToast, showFailToast, showConfirmDialog  } from 'vant';
import router from '@/router';

const user = useUserStore()
const $WEBAPI: any = inject('$WEBAPI')
const WEBAPI = $WEBAPI
const wx: any = inject('wx')

const page = ref(1)
const activeIndex = ref(0)
const data =reactive<any>({
  members: [],
  membersStatistics: {}
})

const getMembersStatistics = async () => {
  const res = await WEBAPI.fxMembersStatistics(wx.getStorage('token'))
  if(res.code === 0) {
    data.membersStatistics = res.data
  }
}

const getMembers = async () => {
  const res = await WEBAPI.fxMembers({
    token: wx.getStorage('token'),
    page: page.value,
    level: activeIndex.value == 0 ? 1 : 2
  })
  if (res.code == 700) {
    if (page.value == 1) {
      data.members = []
    } else {
      showToast('没有更多了')
    }
  }
  if (res.code == 0) {
    const statisticsCommisionMap = res.data.statisticsCommisionMap
    const userCashMap = res.data.userCashMap
    res.data.result.forEach((ele: any) => {
      if (!ele.avatarUrls) {
        ele.avatarUrls = '/images/default.png'
      }
      if (!ele.nicks) {
        ele.nicks = '用户' + ele.uids
      }
      const _statisticsCommisionMap = statisticsCommisionMap[ele.uids]
      if (_statisticsCommisionMap) {
        ele.saleroom = _statisticsCommisionMap.saleroom
        ele.numberOrder = _statisticsCommisionMap.numberOrder
      }
      if (userCashMap) {
        const _userCashMap = userCashMap[ele.uids]
        if (_userCashMap) {
          ele.totleConsumed = _userCashMap.totleConsumed
          ele.totalPayNumber = _userCashMap.totalPayNumber
          ele.totalPayAmount = _userCashMap.totalPayAmount
        }
      }
    })
    if (page.value == 1) {
      data.members = res.data.result
    } else {
      data.members = data.members.concat(res.data.result)
    }
  }
}

const tabChange = (e: any) => {
  activeIndex.value = e
  page.value = 1
  getMembers()
}

const gotoUserDetail = (member: any) => {
  router.push(`/myusers-detail?id=${member.uids}`)
}

onMounted(() => {
  getMembers()
  getMembersStatistics()
})
</script>

<template>
  <van-sticky>
    <van-tabs :active="activeIndex" @change="tabChange">
      <van-tab :title="`直推(${data.membersStatistics.totleChildFxsLevel1 || 0})`" info="number1 ? number1 : ''" />
      <van-tab :title="`间推(${data.membersStatistics.totleChildFxsLevel2 || 0})`" info="number2 ? number2 : ''" />
    </van-tabs>
  </van-sticky>
  <van-empty v-if="!data.members || data.members.length == 0" description="暂无团队" />
  <div v-for="member in data.members" :key="member.id" class="list">
    <img :src="member.avatarUrls" mode="aspectFill" class="l" />
    <div class="r">
      <!-- TODO:用户详情页面制作 -->
      <van-cell :title="member.nicks" :label="member.mobileMasks" is-link @click="gotoUserDetail(member)" />
      <van-cell title-style="flex:2" title="成交额" :value="'¥' + member.totalPayAmount ? member.totalPayAmount : 0" />
      <van-cell title-style="flex:2" title="订单数" :label="'最近下单:' + member.lastOrderDate ? member.lastOrderDate : '-'"
        :value="member.totalPayNumber ? member.totalPayNumber : 0 + '笔'" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.list {
  display: flex;
  align-items: center;
  width: 100vw;
  padding: convertRpxToVw(8) convertRpxToVw(32);
  box-sizing: border-box;
  margin-top: 8px;
}

.list .l {
  width: convertRpxToVw(100);
  height: convertRpxToVw(100);
  border-radius: 50%;
  margin-right: 12px;
}

.list .r {
  flex: 1;
}
</style>
