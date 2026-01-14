import { Shield, Truck, Clock, Users, Award, Heart } from "lucide-react";

const AboutPage = () => {
  const stats = [
    { label: "Khách hàng tin tưởng", value: "15,000+", icon: Users },
    { label: "Sản phẩm độc đáo", value: "3,000+", icon: Award },
    { label: "Năm kinh nghiệm", value: "12+", icon: Shield },
    { label: "Quốc gia giao hàng", value: "25+", icon: Truck },
  ];

  const values = [
    {
      icon: Shield,
      title: "Chính hãng đảm bảo",
      description:
        "Mọi sản phẩm đều là hàng thủ công chính hãng, có nguồn gốc rõ ràng từ các nghệ nhân và làng nghề truyền thống.",
    },
    {
      icon: Truck,
      title: "Giao hàng toàn cầu",
      description:
        "Dịch vụ đóng gói cẩn thận và vận chuyển quốc tế, mang đồ lưu niệm Việt Nam đến khắp năm châu.",
    },
    {
      icon: Clock,
      title: "Tư vấn nhiệt tình",
      description:
        "Đội ngũ am hiểu văn hóa, sẵn sàng tư vấn ý nghĩa và câu chuyện đằng sau mỗi món quà lưu niệm.",
    },
    {
      icon: Heart,
      title: "Tâm huyết văn hóa",
      description:
        "Chúng tôi không chỉ bán sản phẩm mà còn lan tỏa giá trị văn hóa và tình yêu quê hương Việt Nam.",
    },
  ];

  const team = [
    {
      name: "Nguyễn Văn A",
      position: "Giám đốc điều hành",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      description: "12 năm kết nối nghệ nhân và quảng bá văn hóa Việt",
    },
    {
      name: "Trần Thị B",
      position: "Trưởng phòng Sưu tầm",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      description: "Chuyên gia nghiên cứu văn hóa dân gian và thủ công mỹ nghệ",
    },
    {
      name: "Lê Văn C",
      position: "Trưởng phòng Vận hành",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      description: "Chuyên gia logistics với kinh nghiệm vận chuyển quốc tế",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Về Memory Lane
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Nơi lưu giữ và chia sẻ những kỷ niệm đẹp qua từng món quà thủ công,
            mang đậm bản sắc văn hóa và tâm hồn Việt Nam.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Câu chuyện của chúng tôi
              </h2>
              <p className="text-gray-600 text-lg">
                Hành trình từ một cửa hàng nhỏ đến nền tảng thương mại điện tử
                hàng đầu
              </p>
            </div>

            <div className="prose prose-lg mx-auto text-gray-700">
              <p>
                Memory Lane ra đời từ năm 2013 với sứ mệnh bảo tồn và phát huy
                các giá trị văn hóa truyền thống Việt Nam qua những món quà lưu
                niệm tinh tế. Khởi đầu từ một cửa hàng nhỏ tại phố cổ Hà Nội,
                chúng tôi đã dành trọn tâm huyết để kết nối với các làng nghề,
                nghệ nhân khắp ba miền.
              </p>

              <p>
                Từ năm 2018, nhận thấy nhu cầu mua sắm quà tặng trực tuyến và
                lan tỏa văn hóa Việt ra thế giới, chúng tôi đã phát triển nền
                tảng thương mại điện tử. Với mạng lưới hợp tác rộng khắp cùng
                dịch vụ vận chuyển quốc tế, Memory Lane đã trở thành cầu nối văn
                hóa, mang hơi thở Việt Nam đến với người Việt khắp năm châu và
                bạn bè quốc tế.
              </p>

              <p>
                Hôm nay, chúng tôi tự hào phục vụ hơn 15,000 khách hàng với hơn
                3,000 sản phẩm độc đáo, từ tranh lụa, gốm sứ Bát Tràng, đến thêu
                tay, mây tre đan và các món quà handmade tinh xảo. Sứ mệnh của
                chúng tôi là:{" "}
                <strong>"Lưu giữ ký ức - Kết nối tình yêu quê hương"</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những giá trị mà chúng tôi luôn theo đuổi và thực hiện trong mọi
              hoạt động kinh doanh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Đội ngũ lãnh đạo
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những con người yêu văn hóa, tâm huyết với nghề đang dẫn dắt
              Memory Lane phát triển
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Cùng Memory Lane lan tỏa văn hóa Việt
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Hợp tác với chúng tôi để mang giá trị văn hóa truyền thống và những
            món quà ý nghĩa đến gần hơn với mọi người.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Liên hệ với chúng tôi
            </a>
            <a
              href="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors duration-200"
            >
              Khám phá sản phẩm
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
