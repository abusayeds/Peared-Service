"use client";

import { Button, Form } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  useFindOrCreateServiceMutation,
} from "../../../redux/features/catalog/catalogApi";
import CatalogSelect from "../../utils/CatalogSelect";
import { SuccessSwal } from "../../utils/allSwalFire";

function ServiceAddBar() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [form] = Form.useForm();
  const [findOrCreate] = useFindOrCreateServiceMutation();

  const handleAdd = async (values) => {
    const category = values.serviceSearch;
    if (!category) return;

    try {
      if (user) {
        const res = await findOrCreate(category).unwrap();
        localStorage.setItem(
          "selectedCategory",
          res?.data?.name || category
        );
        router.push(`/add-project`);
      } else {
        localStorage.setItem("selectedCategory", category);
        SuccessSwal({
          title: "",
          text: " Please login first! ",
        });
        router.push(`/login?from=/add-project`);
      }
    } catch {
      localStorage.setItem("selectedCategory", category);
      if (user) router.push(`/add-project`);
      else router.push(`/login?from=/add-project`);
    }
  };

  return (
    <div className="flex justify-center items-center mt-4 md:mt-8">
      <div className="flex w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl p-4 h-auto">
        <Form
          form={form}
          layout="inline"
          className="flex w-full justify-center flex-wrap gap-6 md:gap-2"
          onFinish={handleAdd}
        >
          <Form.Item
            name="serviceSearch"
            rules={[
              { required: true, message: "Please select a service category!" },
            ]}
            className="w-full sm:w-2/3 lg:w-3/4 xl:w-1/2"
          >
            <CatalogSelect
              type="service"
              mode="single"
              placeholder="What type of services are you looking for?"
              className="w-full"
            />
          </Form.Item>
          <Form.Item className="w-full sm:w-auto sm:ml-4 mt-4 sm:mt-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="!bg-primary text-white hover:!bg-[#4d7f24] transition duration-300 w-full sm:w-auto"
            >
              Add
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ServiceAddBar;
