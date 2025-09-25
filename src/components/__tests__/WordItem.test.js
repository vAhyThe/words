import { mount } from "@vue/test-utils"
import { vi } from "vitest"
import WordItem from "../WordItem.vue"

describe("WordItem", () => {
  const mockWord = {
    id: "test-word-1",
    text: "Test Word",
    position: 0,
    createdAt: "2023-01-01T00:00:00.000Z",
  }

  it("renders word text correctly", () => {
    const wrapper = mount(WordItem, {
      props: { word: mockWord },
    })

    expect(wrapper.find(".word-text").text()).toBe("Test Word")
  })

  it("shows edit form when edit button is clicked", async () => {
    const wrapper = mount(WordItem, {
      props: { word: mockWord },
    })

    await wrapper.find(".btn-warning").trigger("click")

    expect(wrapper.find(".edit-input").exists()).toBe(true)
    expect(wrapper.find(".edit-input").element.value).toBe("Test Word")
  })

  it("emits update-word event when word is saved", async () => {
    const wrapper = mount(WordItem, {
      props: { word: mockWord },
    })

    await wrapper.find(".btn-warning").trigger("click")
    await wrapper.find(".edit-input").setValue("Updated Word")
    await wrapper.find(".btn-success").trigger("click")

    expect(wrapper.emitted("update-word")).toBeTruthy()
    expect(wrapper.emitted("update-word")[0][0]).toEqual({
      ...mockWord,
      text: "Updated Word",
    })
  })

  it("emits delete-word event when delete button is clicked", async () => {
    const wrapper = mount(WordItem, {
      props: { word: mockWord },
    })

    // Mock confirm dialog
    window.confirm = vi.fn(() => true)

    await wrapper.find(".btn-danger").trigger("click")

    expect(wrapper.emitted("delete-word")).toBeTruthy()
    expect(wrapper.emitted("delete-word")[0][0]).toBe("test-word-1")
  })

  it("cancels edit when escape key is pressed", async () => {
    const wrapper = mount(WordItem, {
      props: { word: mockWord },
    })

    await wrapper.find(".btn-warning").trigger("click")
    await wrapper.find(".edit-input").setValue("Updated Word")
    await wrapper.find(".edit-input").trigger("keyup.escape")

    expect(wrapper.find(".edit-input").exists()).toBe(false)
    expect(wrapper.find(".word-text").text()).toBe("Test Word")
  })

  it("saves edit when enter key is pressed", async () => {
    const wrapper = mount(WordItem, {
      props: { word: mockWord },
    })

    await wrapper.find(".btn-warning").trigger("click")
    await wrapper.find(".edit-input").setValue("Updated Word")
    await wrapper.find(".edit-input").trigger("keyup.enter")

    expect(wrapper.emitted("update-word")).toBeTruthy()
    expect(wrapper.find(".edit-input").exists()).toBe(false)
  })
})
