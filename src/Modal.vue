<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
              Kuka sä olet?
          </div>


          <div class="modal-footer">
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default { name: 'Modal' }
</script>
