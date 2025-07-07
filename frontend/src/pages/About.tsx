import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 py-8 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">About Pasargad Prints</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Bringing your imagination to life through precision 3D printing
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <section className="mb-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-light">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded with a passion for innovation and creativity, Pasargad Prints has been at the forefront 
              of custom 3D printing solutions. We believe that everyone should have access to high-quality, 
              personalized products that reflect their unique vision and needs.
            </p>
          </section>

          <section className="mb-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-light">What We Do</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We specialize in creating custom 3D printed items tailored to your exact specifications. 
              From prototypes and functional parts to artistic creations and personalized gifts, 
              our state-of-the-art 3D printing technology can bring virtually any design to life.
            </p>
          </section>

          <section className="mb-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-light">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              To democratize manufacturing by making custom, high-quality 3D printing accessible to everyone. 
              We strive to turn ideas into reality while maintaining the highest standards of quality, 
              precision, and customer satisfaction.
            </p>
          </section>

          <section className="mb-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-light">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-light">
                <h3 className="text-lg font-semibold text-primary mb-3">Precision Quality</h3>
                <p className="text-base text-gray-600 leading-relaxed">Industry-leading 3D printers ensure every detail is captured with exceptional accuracy.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-light">
                <h3 className="text-lg font-semibold text-primary mb-3">Custom Solutions</h3>
                <p className="text-base text-gray-600 leading-relaxed">Every project is unique. We work with you to create exactly what you envision.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-light">
                <h3 className="text-lg font-semibold text-primary mb-3">Fast Turnaround</h3>
                <p className="text-base text-gray-600 leading-relaxed">Efficient workflows and advanced technology mean quick delivery without compromising quality.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-light">
                <h3 className="text-lg font-semibold text-primary mb-3">Expert Support</h3>
                <p className="text-base text-gray-600 leading-relaxed">Our experienced team guides you through every step of the design and printing process.</p>
              </div>
            </div>
          </section>

          <section className="mb-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-primary-light">Materials & Technology</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We use premium materials including PLA, ABS, PETG, and specialty filaments to ensure 
              your prints are durable, functional, and beautiful. Our advanced FDM and SLA printers 
              deliver professional-grade results for projects of any complexity.
            </p>
          </section>

          <section className="text-center p-8 bg-gradient-to-br from-primary-light to-gray-50 rounded-xl border border-primary mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start Your Project?</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Whether you have a detailed design or just an idea, we're here to help bring it to life. 
              Browse our products or contact us to discuss your custom printing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <a href="/products" className="inline-flex items-center justify-center py-4 px-6 rounded-lg no-underline font-semibold text-base transition-all duration-300 border-2 border-transparent min-w-[150px] bg-primary text-white hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg">
                View Products
              </a>
              <a href="/contact" className="inline-flex items-center justify-center py-4 px-6 rounded-lg no-underline font-semibold text-base transition-all duration-300 border-2 border-primary min-w-[150px] bg-white text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg">
                Contact Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;