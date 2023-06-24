<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch, inject } from 'vue';
import QRCode from 'qrcodejs2'
import html2canvas from 'html2canvas'
import { showFailToast } from 'vant';
import { useUserStore } from '@/stores/user'

export interface Props {
  showcode: boolean
  inviteLink: string
}

const props = withDefaults(defineProps<Props>(), {
  showcode: false,
  inviteLink: ''
})

const user = useUserStore()
const wx: any = inject('wx')
const hasQRCode = ref(false)
// const props = defineProps({
//   showcode: Object
// })

const emit = defineEmits(['changeVi'])

// const qrcodeUrl = ref('') // 邀请链接转成的二维码
const posterUrl = ref('') // 最终生成的海报图
const bgUrl = '/images/invite_bg3.png' // 背景图
let count = 0

// @ts-ignore
watch(() => props.showcode, (val) => {
  console.log(val)
  if(val) {
    count++
    if(count > 1) {
      return
    }
    nextTick(() => {
      // makeQrcode()   // 用关注二维码替换
      drawImage()
    })

  }
})

const closePopup = () => {
  emit("changeVi", false)
}
 
const makeQrcode = () => {
  // 'eyJpZCI6ODQ3MzUwOH0='
  console.log(user.userData)
  let id = user.userData.base.id
  let t = window.btoa(JSON.stringify({ id }))
  let inviteLink = 'https://mall.qdovo.com/mine?t=' + t
  var imageWrapper = document.getElementById("imageWrapper") as HTMLElement
  console.log(inviteLink)

  let qrcode = new QRCode(imageWrapper, {
    width: imageWrapper.offsetWidth,
    height: imageWrapper.offsetHeight,
    text: inviteLink, // 二维码地址
    colorDark: "#000000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H
  })
  hasQRCode.value = true
}

const drawImage = () => {
  var imageWrapper1 = document.getElementById("imageWrapper1") as HTMLElement
  var bg = document.getElementById("posterpopupImg") as HTMLElement
  html2canvas(imageWrapper1, {
    width: imageWrapper1.offsetWidth - 2,
    height: imageWrapper1.offsetHeight - 2,
    allowTaint: true,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    y: 0,
    logging: true,
    // taintTest: false,
    scale: 6,
    // backgroundColor: null
  }).then(function (canvas) {
    posterUrl.value = canvas.toDataURL("image/png")
  }).catch(function (error) {
    console.log(error)
  });
}

</script>

<template>
  <!--子组件-->
  <div v-if="props.showcode" class="posterpopup">
    <van-popup v-model:show="props.showcode" @close="closePopup" close-on-click-overlay closeable close-icon-position="top-right">
      <div id="imageWrapper1">
        <!-- 背景图 -->
        <img id="posterpopupImg" class="posterpopup-img" :src="bgUrl" />
        <!-- 二维码 -->
        <!-- error loading backgroundImage -->
        <!-- <div ref="qrcode" :style="{backgroundImage: `url(${props.inviteLink})`}" id="imageWrapper"></div> -->
        <!-- error load image -->
        <img ref="qrcode" :src="props.inviteLink" id="imageWrapper" />
        <img class="avatar" :src="user.userData.base.avatarUrl" />
      </div>
      <!-- 最终生成的海报图 -->
      <div class="posterpopup-img1" v-if="posterUrl">
        <img :src="posterUrl" id="posterUrl" />
      </div>
      <!-- <div class="posterpopup-wrap">
        <div class="wrap-text">长按保存图片</div>
      </div> -->
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.posterpopup {
  $poster-margin: 20px;
  $poster-margin-bottom: 40px;
  $poster-margin-top: 20px;
  position: absolute;
  top: $poster-margin-top;
  bottom: $poster-margin-bottom;
  left: $poster-margin;
  right: $poster-margin;
  margin: auto;
  ::v-deep .van-popup {
    width: calc(100% - $poster-margin * 2);
    height: calc(100% - $poster-margin-top - $poster-margin-bottom);
    top: 20px;
    transform: translateY(0);
    background-color: transparent;
    overflow-y: hidden;
  }
  // 背景图
  #imageWrapper1 {
    position: relative;
    width: 100%;
    height: 100%;
    // height: 70vh;
    overflow: hidden;
    background-color: transparent;
    // 背景图
    .posterpopup-img {
      width: 100%;
      // height: 100%;
      transform: translateY(12%);
    }
    // 二维码
    #imageWrapper {
      position: absolute;
      z-index: 100;
      width: convertRpxToVw(200);
      height: convertRpxToVw(200);
      // top: calc(106vw + 12px);
      // top: 62.5%;
      // top: 70vh;
      top: 53%;
      transform: translateY(88%);
      right: 2vw;
      border-radius: 6px;
      @media (max-height: 700px){
        top: 61%;
      }
      @media (min-height: 800px) and (max-height: 850px){
        top: 50%;
      }
      // background-size: contain;
      object-fit: contain;
    }
    .avatar {
      // border: 1px solid red;
      position: absolute;
      top: 90vw;
      // top: 46vh;
      left: 11px;
      width: 20vw;
      border-radius: 6px;
    }
  }
  // 海报图元素
  .posterpopup-img1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // background-color: transparent;
    & img {
      // width: 100%;
      height: 100%;
      // background-color: transparent;
    }
  }

  .posterpopup-wrap {
    position: absolute;
    width: 302px;
    height: 70px;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    // margin-top: 100px;
    margin: 39px auto 0;

    &>img {
      width: 100%;
      height: 100%;
    }

    .wrap-text {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 30px;
      color: #fff;
    }
  }
}</style>