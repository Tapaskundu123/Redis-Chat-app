-- CreateTable
CREATE TABLE "Chat_groups" (
    "id" UUID NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(191) NOT NULL,
    "passcode" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group_users" (
    "id" SERIAL NOT NULL,
    "group_id" UUID NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chat_groups_createdAt_idx" ON "Chat_groups"("createdAt");

-- AddForeignKey
ALTER TABLE "Chat_groups" ADD CONSTRAINT "Chat_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_users" ADD CONSTRAINT "Group_users_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Chat_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
