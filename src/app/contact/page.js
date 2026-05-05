"use client";

import { Button, Form, Input, message } from "antd";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { ErrorSwal, SuccessSwal } from "../../components/utils/allSwalFire";
import CustomHeading from "../../components/utils/CustomHeading";
import { useContactUsMutation } from "../../redux/features/feedback/feedbackApi";

export default function Contact() {
  const { user } = useSelector((state) => state.auth);
  const [contactUs, { isLoading }] = useContactUsMutation();

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await contactUs(values).unwrap();
      SuccessSwal({
        title: "",
        text: " Sent Message Successfully! ",
      });
      form.resetFields();
    } catch (error) {
      ErrorSwal({
        title: "",
        text:
          error?.message || error?.data?.message || " Something went wrong ",
      });
    }
  };

  const onFinishFailed = () => {
    message.error("Please check the form and try again.");
  };

  return (
    <section className="py-4 md:py-20 overflow-y-scroll no-scrollbar">
      <div className="container mx-auto md:px-4">
        <div className="text-center mb-4">
          <CustomHeading> Contact Us </CustomHeading>
        </div>
        <div className="grid grid-col-1 md:grid-cols-1 lg:grid-cols-2 gap-4 justify-center items-center md:py-4 md:px-40">
          <div>
            <div className="flex items-center mb-6 px-4 py-3 bg-secondary border border-primary rounded ">
              <FaPhoneAlt className="text-primary text-3xl mr-4 mt-1" />
              <div>
                <h3 className="text-lg font-medium">Call Us</h3>
                <p className="text-sm text-gray-600">+(08) 255 201 888</p>
              </div>
            </div>
            <div className="flex items-center mb-6 px-4 py-3 bg-secondary border border-primary rounded ">
              <FaEnvelope className="text-primary text-3xl mr-4 mt-1" />
              <div>
                <h3 className="text-lg font-medium">Email Now</h3>
                <p className="text-sm text-gray-600">peared@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center mb-6 px-4 py-3 bg-secondary border border-primary rounded ">
              <FaMapMarkerAlt className="text-primary text-3xl mr-4 mt-1" />
              <div>
                <h3 className="text-lg font-medium">Address</h3>
                <p className="text-sm text-gray-600">
                  7510, Brand Tower, New York, USA
                </p>
              </div>
            </div>
          </div>

          <div>
            <Form
              form={form}
              name="contact_form"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                name="name"
                initialValue={user?.name}
                rules={[{ required: true, message: "Please enter your name!" }]}
              >
                <Input placeholder="Your Name" readOnly />
              </Form.Item>

              <Form.Item
                name="email"
                initialValue={user?.email}
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Your Email" readOnly />
              </Form.Item>

              <Form.Item
                name="message"
                rules={[
                  { required: true, message: "Please enter your message!" },
                  {
                    min: 20,
                    message:
                      "Your message must contain at least 20 characters.",
                  },
                  {
                    max: 200,
                    message: "Your message cannot exceed 200 characters.",
                  },
                ]}
              >
                <Input.TextArea
                  rows={7}
                  placeholder="Your Message (Min 20, Max 200 characters)"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  loading={isLoading}
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-primary text-white hover:bg-white hover:text-primary"
                >
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
