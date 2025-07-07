import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 py-8 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">Contact Us</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get in touch with our team for custom 3D printing solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-light">Get In Touch</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Ready to bring your ideas to life? We'd love to hear about your project 
                and discuss how we can help you create something amazing with 3D printing.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
                <div className="text-2xl p-3 bg-primary-light rounded-full min-w-[60px] text-center">📧</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">info@pasargadprints.com</p>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">support@pasargadprints.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
                <div className="text-2xl p-3 bg-primary-light rounded-full min-w-[60px] text-center">📱</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone</h3>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">+1 (555) 123-4567</p>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">Mon-Fri: 9AM-6PM PST</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
                <div className="text-2xl p-3 bg-primary-light rounded-full min-w-[60px] text-center">📍</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Address</h3>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">123 Innovation Drive</p>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">Tech City, TC 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
                <div className="text-2xl p-3 bg-primary-light rounded-full min-w-[60px] text-center">💬</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Chat</h3>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">Available on our website</p>
                  <p className="text-base text-gray-600 my-1 leading-relaxed">Response time: 2-4 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-primary-light">Send Us a Message</h2>
              <form className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="firstName" className="text-sm font-semibold text-gray-800 mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="lastName" className="text-sm font-semibold text-gray-800 mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-800 mb-2">Subject</label>
                  <select id="subject" name="subject" required className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base transition-all duration-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option value="">Select a topic</option>
                    <option value="quote">Request a Quote</option>
                    <option value="support">Technical Support</option>
                    <option value="general">General Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-800 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Tell us about your project, requirements, or any questions you have..."
                    required
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 text-base transition-all duration-300 resize-y min-h-[120px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  ></textarea>
                </div>

                <div className="flex flex-row items-center gap-3">
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" name="newsletter" className="w-[18px] h-[18px] m-0" />
                    <span>Subscribe to our newsletter for updates and special offers</span>
                  </label>
                </div>

                <button type="submit" className="py-4 px-8 bg-primary text-white border-none rounded-lg text-lg font-semibold cursor-pointer transition-all duration-300 self-start hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg md:w-auto w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center pb-3 border-b-2 border-primary-light">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
              <h3 className="text-lg font-semibold text-primary mb-3">What file formats do you accept?</h3>
              <p className="text-base text-gray-600 leading-relaxed m-0">We accept STL, OBJ, 3MF, and most common 3D file formats. If you're unsure, feel free to reach out!</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
              <h3 className="text-lg font-semibold text-primary mb-3">How long does printing take?</h3>
              <p className="text-base text-gray-600 leading-relaxed m-0">Typical turnaround is 3-7 business days depending on complexity and quantity. Rush orders available.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
              <h3 className="text-lg font-semibold text-primary mb-3">Do you offer design services?</h3>
              <p className="text-base text-gray-600 leading-relaxed m-0">Yes! Our team can help design your project from concept to final print-ready files.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-light">
              <h3 className="text-lg font-semibold text-primary mb-3">What's your minimum order?</h3>
              <p className="text-base text-gray-600 leading-relaxed m-0">We accept orders of any size, from single prototypes to large production runs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;