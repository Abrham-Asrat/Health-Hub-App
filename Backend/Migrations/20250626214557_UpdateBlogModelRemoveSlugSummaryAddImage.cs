using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthHub.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBlogModelRemoveSlugSummaryAddImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Blogs_Slug",
                table: "Blogs");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Blogs");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "Blogs");

            migrationBuilder.AddColumn<Guid>(
                name: "ImageId",
                table: "Blogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Blogs_ImageId",
                table: "Blogs",
                column: "ImageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Blogs_Files_ImageId",
                table: "Blogs",
                column: "ImageId",
                principalTable: "Files",
                principalColumn: "FileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Blogs_Files_ImageId",
                table: "Blogs");

            migrationBuilder.DropIndex(
                name: "IX_Blogs_ImageId",
                table: "Blogs");

            migrationBuilder.DropColumn(
                name: "ImageId",
                table: "Blogs");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Blogs",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "Blogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Blogs_Slug",
                table: "Blogs",
                column: "Slug",
                unique: true);
        }
    }
}
