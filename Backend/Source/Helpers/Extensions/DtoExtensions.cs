using HealthHub.Source.Models.Defaults;
using HealthHub.Source.Models.Dtos;
using HealthHub.Source.Models.Entities;
using HealthHub.Source.Models.Enums;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;

namespace HealthHub.Source.Helpers.Extensions;

public static class DtoExtensions
{
  /// <summary>
  /// Maps RegisterUserDto to User, Notice: You will lose password property from returned User though!
  /// </summary>
  /// <param name="userDto"></param>
  /// <returns>User instance</returns>
  public static User ToUser(this RegisterUserDto userDto)
  {
    return new User()
    {
      FirstName = userDto.FirstName,
      LastName = userDto.LastName,
      Email = userDto.Email,
      Phone = userDto.Phone,
      Address = userDto.Address,
      Gender = userDto.Gender.ConvertToEnum<Gender>(),
      Role = userDto.Role.ConvertToEnum<Role>(),
      DateOfBirth = userDto.DateOfBirth.ConvertTo<DateOnly>()
    };
  }

  /// <summary>
  /// Maps CreatePatientDto to Patient
  /// </summary>
  /// <param name="createPatientDto"></param>
  /// <returns></returns>
  public static Patient ToPatient(this CreatePatientDto createPatientDto)
  {
    return new Patient()
    {
      User = createPatientDto.User,
      UserId = createPatientDto.User.UserId,
      MedicalHistory = createPatientDto.MedicalHistory,
      EmergencyContactName = createPatientDto.EmergencyContactName,
      EmergencyContactPhone = createPatientDto.EmergencyContactPhone
    };
  }

  /// <summary>
  /// Maps CreateDoctorDto to Doctor
  /// </summary>
  /// <param name="createDoctorDto"></param>
  /// <returns></returns>
  public static Doctor ToDoctor(this CreateDoctorDto createDoctorDto, Guid doctorPreferenceId)
  {
    return new Doctor()
    {
      User = createDoctorDto.User,
      UserId = createDoctorDto.User.UserId,
      Qualifications = createDoctorDto.Qualifications,
      Biography = createDoctorDto.Biography,
      DoctorStatus = createDoctorDto.DoctorStatus,
      CvId = createDoctorDto.Cv.FileId,
      Cv = createDoctorDto.Cv,
      DoctorPreferenceId = doctorPreferenceId
    };
  }

  /// <summary>
  /// Maps CreateAdminDto to Admin
  /// </summary>
  /// <param name="createAdminDto"></param>
  /// <returns></returns>
  public static Admin ToAdmin(this CreateAdminDto createAdminDto)
  {
    return new Admin() { User = createAdminDto.User, UserId = createAdminDto.User.UserId };
  }

  public static Speciality ToSpeciality(this CreateSpecialityDto specialityDto)
  {
    return new Speciality() { SpecialityName = specialityDto.SpecialityName };
  }

  public static DoctorSpeciality ToDoctorSpeciality(
    this CreateDoctorSpecialityDto createDoctorSpecialityDto,
    Guid doctorId,
    Guid specialityId
  )
  {
    return new DoctorSpeciality() { DoctorId = doctorId, SpecialityId = specialityId };
  }

  public static Education ToEducation(this CreateEducationDto createEducationDto, Guid doctorId)
  {
    return new Education
    {
      Degree = createEducationDto.Degree,
      Institution = createEducationDto.Institution,
      DoctorId = doctorId,
      StartDate = createEducationDto.StartDate.ConvertTo<DateOnly>(),
      EndDate = createEducationDto.EndDate.ConvertTo<DateOnly>()
    };
  }

  public static Experience ToExperience(this CreateExperienceDto createExperienceDto, Guid doctorId)
  {
    return new Experience
    {
      Institution = createExperienceDto.Institution,
      EndDate =
        createExperienceDto.EndDate == null
          ? null
          : createExperienceDto.EndDate.ConvertTo<DateOnly>(),
      StartDate = createExperienceDto.StartDate.ConvertTo<DateOnly>(),
      Description = createExperienceDto.Description,
      DoctorId = doctorId
    };
  }

  public static Models.Entities.File ToFile(this CreateFileDto createFileDto)
  {
    return new Models.Entities.File
    {
      FileData = FileHelper.ToByteStream(createFileDto.FileDataBase64),
      FileName = createFileDto.FileName,
      MimeType = createFileDto.MimeType
    };
  }

  public static Message ToMessage(this CreateMessageDto createMessageDto, Guid conversationId)
  {
    return new Message
    {
      MessageText = createMessageDto.MessageText,
      SenderId = createMessageDto.SenderId,
      ConversationId = conversationId
    };
  }

  public static Payment ToPayment(
    this CreatePaymentDto createPaymentDto,
    string transactionReference
  )
  {
    return new Payment
    {
      Amount = createPaymentDto.Amount,
      SenderId = createPaymentDto.SenderId,
      SenderName = createPaymentDto.SenderName,
      SenderEmail = createPaymentDto.SenderEmail,
      ReceiverId = createPaymentDto.ReceiverId,
      ReceiverName = createPaymentDto.ReceiverName,
      ReceiverEmail = createPaymentDto.ReceiverEmail,
      PaymentProvider = createPaymentDto.PaymentProvider,
      PaymentStatus = PaymentStatus.Pending,
      TransactionReference = transactionReference,
      PaymentType = createPaymentDto.PaymentType
    };
  }

  public static CreatePaymentDto ToCreatePaymentDto(
    this TransferRequestDto transferRequestDto,
    Guid senderId,
    bool isSuccessful
  )
  {
    return new CreatePaymentDto
    {
      Amount = transferRequestDto.Amount,
      ReceiverId = transferRequestDto.ReceiverId,
      SenderId = senderId,
      PaymentProvider = transferRequestDto.PaymentProvider,
      PaymentStatus = isSuccessful ? PaymentStatus.Success : PaymentStatus.Failed,
      SenderName = transferRequestDto.SenderName,
      SenderEmail = transferRequestDto.SenderEmail,
      ReceiverName = transferRequestDto.ReceiverName,
      ReceiverEmail = transferRequestDto.ReceiverEmail,
      PaymentType = PaymentType.Transfer
    };
  }

  public static Blog ToBlog(this CreateBlogDto createBlogDto)
  {
    return new Blog
    {
      AuthorId = createBlogDto.AuthorId,
      Content = createBlogDto.Content,
      Title = createBlogDto.Title,
      ImageId = createBlogDto.ImageId,
    };
  }

  public static BlogComment ToBlogComment(this CreateBlogCommentDto createBlogCommentDto)
  {
    return new BlogComment
    {
      BlogId = createBlogCommentDto.BlogId,
      CommentText = createBlogCommentDto.CommentText,
      SenderId = createBlogCommentDto.SenderId
    };
  }

  public static BlogLike ToBlogLike(this CreateBlogLikeDto createBlogLikeDto)
  {
    return new BlogLike { BlogId = createBlogLikeDto.BlogId, UserId = createBlogLikeDto.UserId };
  }

  public static Review ToReview(this CreateReviewDto createReviewDto)
  {
    return new Review
    {
      ReviewText = createReviewDto.ReviewText,
      DoctorId = createReviewDto.DoctorId,
      PatientId = createReviewDto.PatientId,
      StarRating = createReviewDto.StarRating
    };
  }
}
