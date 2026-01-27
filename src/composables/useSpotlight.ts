import { ref } from 'vue';

const isSpotlightVisible = ref(false);

export function useSpotlight() {
  const openSpotlight = () => {
    isSpotlightVisible.value = true;
  };

  const closeSpotlight = () => {
    isSpotlightVisible.value = false;
  };

  const toggleSpotlight = () => {
    isSpotlightVisible.value = !isSpotlightVisible.value;
  };

  return {
    isSpotlightVisible,
    openSpotlight,
    closeSpotlight,
    toggleSpotlight
  };
}
