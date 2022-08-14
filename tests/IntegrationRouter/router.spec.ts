import {mount} from "@vue/test-utils";
import router from "./router";
import {nextTick} from "vue";
import {getCurrentModal, modalQueue, useModalRouter} from "../../plugin/index";
import wait from "../wait";
import App from "./App.vue";
import Modal from "../../plugin/utils/Modal";

beforeEach(async () => {
	modalQueue.value = [];
	await router.push("/");
	await router.isReady();
	await wait()
})

useModalRouter.init(router);

describe("Integration with VueRouter", () => {

	it("Default", async () => {
		await router.push('/');
		// After this line, router is ready
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});

		expect(wrapper.text()).toBe("Test");
	})
	it("Opening a window on a simple match", async () => {
		await router.push("/simple-modal");
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});

		await nextTick();

		expect(wrapper.text()).toBe("Modal router");
	})
	it("Opening and the closing", async () => {

		await router.push("/simple-modal");
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});
		await nextTick();
		expect(wrapper.text()).toBe("Modal router");
		await router.push("/");

		await wait()

		expect(wrapper.text()).toBe("Test");

	})
	it("Open child routeModal with params", async () => {
		await router.push("/users/3");
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});

		await nextTick();

		expect(wrapper.text()).toBe("user-3");
	})
	it("Open a list of child routeModal", async () => {
		await router.push("/users/3");
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});

		for(let i = 0; i < 5; i++) {
			await router.push("/users/"+i);
			await nextTick();
			await wait();
			
			
			expect(wrapper.text()).toBe(`user-${i}`);
		}
	})
	it("Closing modal with guard", async () => {
		await router.push("/guard");
		await router.isReady();

		expect(router.currentRoute.value.path).toBe("/guard");

		try {
			await router.push("/");

		} catch (e) {
			console.log("error with open route /");
		}
		await router.isReady();

		expect(router.currentRoute.value.path).toBe("/guard");
	})
	it("Push", async () => {
		await router.push("/");
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});

		await router.push("/a");
		await nextTick();

		await router.push("/b");
		await nextTick();

		await nextTick();
		await router.push("/users/3");

		await nextTick();
		await wait();
		expect(wrapper.text()).toBe("user-3");

		await router.push("/");
		await wait();

		expect(wrapper.text()).toBe("Test");
	})
	it("Back", async () => {
		await router.push("/");
		await router.isReady();

		const wrapper = await mount(App, {global: {plugins: [router]}});

		await nextTick();
		await router.push("/users/3");

		await nextTick();
		await wait();

		expect(wrapper.text()).toBe("user-3");

		await router.go(-1);
		await wait();

		expect(wrapper.text()).toBe("Test");
	})

	it("Modal.isRoute should be true, when modal was opened by RouterIntegration", async () => {
		await router.push("/");
		await router.isReady();
		const wrapper = await mount(App, {global: {plugins: [router]}});
		await nextTick();
		await wait();

		await router.push("/router-simple-modal");
		await wait();
		const modal = getCurrentModal() as Modal;
		expect(modal.isRoute).toBe(true);
	})

});
