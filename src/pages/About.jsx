export default function About() {
    return (
      <div className="bg-slate-50">
  
        {/* HERO / STATS SECTION */}
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              About  EventSphere
            </h1>
            <p className="text-blue-100 max-w-3xl mx-auto mb-10 text-md">
            Our Event App is a smart and user-friendly platform designed to simplify the way events are created, managed, and experienced. We bring organizers and participants together in one seamless digital space, making event planning and attendance easier, faster, and more engaging.<br/>

            From academic programs and workshops to social gatherings and large-scale events, our platform helps communities stay informed, connected, and involved.<br/>
            Your all-in-one platform for discovering, planning, and managing events with ease.
            </p>
  
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                ["150+", "Events per year"],
                ["5,000+", "Active students"],
                ["80+", "Organizers"],
                ["25+", "Student clubs"],
              ].map(([value, label]) => (
                <div key={label}>
                  <h3 className="text-3xl font-bold">{value}</h3>
                  <p className="text-blue-100 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* FEATURE CARDS */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
              <p className="text-gray-600 text-md">
              Our mission is to empower organizers with powerful tools to manage events efficiently while giving attendees an enjoyable and stress-free experience. We aim to promote participation, transparency, and accessibility in every event.<br/>
              To empower individuals, organizations, and communities to bring their events to life effortlessly.
              We create a space where organizers showcase their work, and attendees find events that matter to them.
              </p>
            </div>
  
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">Our Vision</h3>
              <p className="text-gray-600 text-md">
              A world where no event goes unnoticed — connecting people to opportunities that inspire, entertain, and educate.
             With EventSphere, every moment matters, and every event finds its spotlight.<br/>
             We envision a connected community where events are well-organized, participation is effortless, and every experience leaves a lasting impact. Our goal is to become a trusted solution for managing events of all sizes.
              </p>
            </div>
          </div>
        </section>
  
        {/* WHAT WE DO */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">
              What We Do
            </h2>
  
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                ["Event Planning & Publishing", "Create, publish, and share events with a wider audience."],
                ["Comprehensive Event Listings", " Browse upcoming and past events with full details."],
                ["Management Tools", "Track attendees, updates, and logistics all in one place."],
                ["User-Friendly Experience", "Designed for simplicity — smooth experience for both organizers and attendees."],
                ["Seamless Registration", "Participants can register and track events in just a few clicks."],
                ["Media Gallery", "Capture memories through photos and videos shared after events"],
                ["Certificates & Feedback","Issue certificates and collect valuable feedback digitally."],
                ["Real-Time Updates","Stay informed with announcements and event notifications."]
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-xl border p-5 hover:shadow transition"
                >
                  <h4 className="font-semibold mb-1">{title}</h4>
                  <p className="text-md text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className=" px-4  bg-white w-full pb-6">
           
            <div className="bg-white rounded-xl shadow p-6 text-center lg:w-[700px] m-auto sm:w-[300px]">
                <h3  className="font-semibold text-lg mb-2">Why Choose Our Platform</h3>
                <p className="text-gray-600 text-md">
                Our platform is built with simplicity, security, and performance in mind. Whether you are an event organizer or a participant, the app provides a smooth experience across devices. We focus on reliability, modern design, and continuous improvement to meet the evolving needs of our users.
                </p>

            </div>
        </section>
  
        {/* MEET OUR TEAM */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">
              Meet Our Team
            </h2>
  
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {["Alex Johnson", "Sarah Lee", "Michael Kim", "Fatima Ahmed"].map(
                (name) => (
                  <div
                    key={name}
                    className="bg-white rounded-xl shadow p-6 text-center"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 mb-4" />
                    <h4 className="font-semibold">{name}</h4>
                    <p className="text-md text-gray-500">
                      Events Coordinator
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
        <section className="px-4  bg-white w-full pb-6">
           
            <div className="bg-white rounded-xl shadow p-6 text-center lg:w-[700px] m-auto sm:w-[300px]">
                <h3  className="font-semibold text-lg mb-2">Join Us</h3>
                <p className="text-gray-600 text-sm">
                Be part of a growing community that values organization, engagement, and memorable experiences. With our Event App, every event matters.
                </p>

            </div>
        </section>
      </div>
    );
  }
  