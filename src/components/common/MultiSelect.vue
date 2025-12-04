<template>
  <div class="multi-select" ref="multiSelectRef">
    <div class="selected-items">
      <div v-for="item in selectedItems" :key="item.value" class="selected-item">
        <span>{{ item.label }}</span>
        <button @click.stop="removeItem(item.value)" class="remove-item-btn">&times;</button>
      </div>
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="placeholder"
        @focus="isOpen = true"
        @input="filterOptions"
        class="search-input"
      />
    </div>
    <div v-if="isOpen" class="options-list">
      <div
        v-for="option in filteredOptions"
        :key="option.value"
        @click="selectItem(option)"
        class="option-item"
      >
        {{ option.label }}
      </div>
      <div v-if="filteredOptions.length === 0" class="no-options">
        No options found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Option {
  value: number | string
  label: string
}

const props = defineProps<{
  options: Option[]
  modelValue: (number | string)[]
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const searchQuery = ref('')
const multiSelectRef = ref<HTMLElement | null>(null)

const selectedItems = computed(() =>
  props.options.filter((option) => props.modelValue.includes(option.value)),
)

const filteredOptions = computed(() =>
  props.options.filter(
    (option) =>
      !props.modelValue.includes(option.value) &&
      option.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

const selectItem = (option: Option) => {
  const newValue = [...props.modelValue, option.value]
  emit('update:modelValue', newValue)
  searchQuery.value = ''
}

const removeItem = (value: number | string) => {
  const newValue = props.modelValue.filter((v) => v !== value)
  emit('update:modelValue', newValue)
}

const filterOptions = () => {
  // This is handled by the computed property
}

// Close dropdown when clicking outside
watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('click', closeOnClickOutside)
  } else {
    document.removeEventListener('click', closeOnClickOutside)
  }
})

const closeOnClickOutside = (event: MouseEvent) => {
  if (multiSelectRef.value && !multiSelectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}
</script>

<style scoped>
.multi-select {
  position: relative;
  width: 100%;
}

.selected-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  cursor: text;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--color-gray-100);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.remove-item-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: var(--spacing-xs);
  min-width: 100px;
}

.options-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-xs);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.option-item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.option-item:hover {
  background-color: var(--color-gray-100);
}

.no-options {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-gray-500);
}
</style>
