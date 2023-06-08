<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import QRCode from 'qrcodejs2'
import html2canvas from 'html2canvas'

export interface Props {
  showcode: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showcode: false
})
const hasQRCode = ref(false)
// const props = defineProps({
//   showcode: Object
// })

const emit = defineEmits(['changeVi'])

// const qrcodeUrl = ref('') // 邀请链接转成的二维码
const posterUrl = ref('') // 最终生成的海报图
const bgUrl = '/images/invite_bg.png' // 背景图
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
      makeQrcode()
      drawImage()
    })

  }
})


const closePopup = () => {
  emit("changeVi", false)
}
 
const makeQrcode = () => {
  let inviteLink = 'https://mall.qdovo.com/mine?t=eyJpZCI6ODQ3MzUwOH0='
  var imageWrapper = document.getElementById("imageWrapper") as HTMLElement
  console.log(imageWrapper)

  let qrcode = new QRCode(imageWrapper, {
    width: imageWrapper.offsetWidth,
    height: imageWrapper.offsetHeight,
    text: inviteLink, // 二维码地址
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  })
  hasQRCode.value = true
}

const drawImage = () => {
  var imageWrapper1 = document.getElementById("imageWrapper1") as HTMLElement
  html2canvas(imageWrapper1, {
    width: imageWrapper1.offsetWidth,
    height: imageWrapper1.offsetHeight,
    allowTaint: true,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    logging: true,
    // taintTest: false,
    scale: 6
  }).then(function (canvas) {
    posterUrl.value = canvas.toDataURL("image/png")
  }).catch(function (error) {
    console.log(error)
  });
}

</script>

<template>
  <!--子组件-->
  <div class="posterpopup">
    <van-popup v-model:show="props.showcode" @close="closePopup" close-on-click-overlay closeable>
      <div id="imageWrapper1">
        <!-- 背景图 -->
        <img class="posterpopup-img" :src="bgUrl" />
        <!-- 二维码 -->
        <div class="qrcode1" ref="qrcode" id="imageWrapper">
          <!-- <qrcode :url="qrUrl" colorDark="#000" colorLight="#fff" :wid="wid" :hei="wid" :imgwid="imgwid" :imghei="imgwid">
          </qrcode> -->
        </div>
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
  $poster-margin-bottom: 80px;
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
    overflow: hidden;
    // 背景图
    .posterpopup-img {
      width: 100%;
      // height: 100%;
    }
    // 二维码
    #imageWrapper {
      position: absolute;
      width: convertRpxToVw(380);
      height: convertRpxToVw(380);
      top: calc(42vh );
      right: 50%;
      transform: translate(50%, calc(-50%));
    }
  }
  // 海报图元素
  .posterpopup-img1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    & img {
      // width: 100%;
      height: 100%;
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