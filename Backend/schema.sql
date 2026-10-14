CREATE TABLE [Categories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(80) NOT NULL,
    [Slug] nvarchar(160) NOT NULL,
    [Description] nvarchar(500) NULL,
    [ImagePath] nvarchar(500) NULL,
    [ParentId] int NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Categories_Categories_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [CommissionSettings] (
    [Id] int NOT NULL IDENTITY,
    [Percentage] decimal(5,2) NOT NULL,
    [EffectiveFrom] datetime2 NOT NULL,
    [IsActive] bit NOT NULL,
    [Notes] nvarchar(200) NULL,
    [CreatedByAdminId] int NULL,
    CONSTRAINT [PK_CommissionSettings] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Deals] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(160) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [DiscountPercent] decimal(5,2) NOT NULL,
    [StartsAt] datetime2 NOT NULL,
    [EndsAt] datetime2 NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Deals] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Notifications] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Title] nvarchar(160) NOT NULL,
    [Message] nvarchar(500) NOT NULL,
    [IsRead] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Transactions] (
    [Id] int NOT NULL IDENTITY,
    [OrderId] int NULL,
    [ShopId] int NULL,
    [PayoutId] int NULL,
    [Type] nvarchar(40) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [BalanceAfter] decimal(18,2) NOT NULL,
    [Note] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [FullName] nvarchar(120) NOT NULL,
    [Email] nvarchar(160) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Phone] nvarchar(40) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Carts] (
    [Id] int NOT NULL IDENTITY,
    [CustomerId] int NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Carts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Carts_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Orders] (
    [Id] int NOT NULL IDENTITY,
    [OrderNumber] nvarchar(40) NOT NULL,
    [CustomerId] int NOT NULL,
    [ShippingAddress] nvarchar(200) NOT NULL,
    [ShippingCity] nvarchar(80) NOT NULL,
    [ShippingPhone] nvarchar(40) NOT NULL,
    [Subtotal] decimal(18,2) NOT NULL,
    [ShippingFee] decimal(18,2) NOT NULL,
    [Total] decimal(18,2) NOT NULL,
    [PaymentStatus] int NOT NULL,
    [PaymentMethod] int NOT NULL,
    [PaymentReference] nvarchar(200) NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ConfirmedAt] datetime2 NULL,
    [DeliveredAt] datetime2 NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Orders_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Shops] (
    [Id] int NOT NULL IDENTITY,
    [OwnerUserId] int NOT NULL,
    [ShopName] nvarchar(160) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [Address] nvarchar(200) NOT NULL,
    [City] nvarchar(80) NOT NULL,
    [ShopPhone] nvarchar(40) NOT NULL,
    [ShopCategory] nvarchar(80) NOT NULL,
    [ShopImagePath] nvarchar(500) NULL,
    [LicenseNumber] nvarchar(80) NOT NULL,
    [LicenseIssueDate] datetime2 NOT NULL,
    [LicenseExpiryDate] datetime2 NOT NULL,
    [IssuingAuthority] nvarchar(160) NOT NULL,
    [LicenseDocumentPath] nvarchar(500) NULL,
    [BankName] nvarchar(80) NULL,
    [BankAccountTitle] nvarchar(80) NULL,
    [BankAccountNumber] nvarchar(40) NULL,
    [Status] int NOT NULL,
    [RejectionReason] nvarchar(500) NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    [ApprovedAt] datetime2 NULL,
    CONSTRAINT [PK_Shops] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Shops_Users_OwnerUserId] FOREIGN KEY ([OwnerUserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Refunds] (
    [Id] int NOT NULL IDENTITY,
    [OrderId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Reason] nvarchar(400) NOT NULL,
    [Status] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [ResolvedAt] datetime2 NULL,
    CONSTRAINT [PK_Refunds] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Refunds_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Products] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(200) NOT NULL,
    [Description] nvarchar(2000) NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Discount] decimal(5,2) NOT NULL,
    [StockQuantity] int NOT NULL,
    [SKU] nvarchar(60) NOT NULL,
    [Brand] nvarchar(80) NOT NULL,
    [Weight] float NOT NULL,
    [CategoryId] int NOT NULL,
    [ShopId] int NOT NULL,
    [ApprovalStatus] int NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Products_Shops_ShopId] FOREIGN KEY ([ShopId]) REFERENCES [Shops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [SellerApplications] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [ShopId] int NULL,
    [Notes] nvarchar(500) NULL,
    [Status] int NOT NULL,
    [SubmittedAt] datetime2 NOT NULL,
    [ReviewedAt] datetime2 NULL,
    [ReviewedByAdminId] int NULL,
    CONSTRAINT [PK_SellerApplications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SellerApplications_Shops_ShopId] FOREIGN KEY ([ShopId]) REFERENCES [Shops] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_SellerApplications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [SellerOrders] (
    [Id] int NOT NULL IDENTITY,
    [OrderId] int NOT NULL,
    [ShopId] int NOT NULL,
    [SellerOrderNumber] nvarchar(40) NOT NULL,
    [Subtotal] decimal(18,2) NOT NULL,
    [ShippingFee] decimal(18,2) NOT NULL,
    [CommissionAmount] decimal(18,2) NOT NULL,
    [SellerEarning] decimal(18,2) NOT NULL,
    [Total] decimal(18,2) NOT NULL,
    [Status] int NOT NULL,
    [ShippedAt] datetime2 NULL,
    [DeliveredAt] datetime2 NULL,
    [TrackingNumber] nvarchar(200) NULL,
    CONSTRAINT [PK_SellerOrders] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SellerOrders_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_SellerOrders_Shops_ShopId] FOREIGN KEY ([ShopId]) REFERENCES [Shops] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [SellerPayouts] (
    [Id] int NOT NULL IDENTITY,
    [ShopId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Status] int NOT NULL,
    [Reference] nvarchar(200) NULL,
    [Notes] nvarchar(400) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [PaidAt] datetime2 NULL,
    CONSTRAINT [PK_SellerPayouts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SellerPayouts_Shops_ShopId] FOREIGN KEY ([ShopId]) REFERENCES [Shops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [ShopDocuments] (
    [Id] int NOT NULL IDENTITY,
    [ShopId] int NOT NULL,
    [DocumentType] nvarchar(40) NOT NULL,
    [FilePath] nvarchar(500) NOT NULL,
    [OriginalFileName] nvarchar(120) NOT NULL,
    [UploadedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_ShopDocuments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ShopDocuments_Shops_ShopId] FOREIGN KEY ([ShopId]) REFERENCES [Shops] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [CartItems] (
    [Id] int NOT NULL IDENTITY,
    [CartId] int NOT NULL,
    [ProductId] int NOT NULL,
    [Quantity] int NOT NULL,
    [AddedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_CartItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CartItems_Carts_CartId] FOREIGN KEY ([CartId]) REFERENCES [Carts] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CartItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [ProductImages] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [FilePath] nvarchar(500) NOT NULL,
    [IsPrimary] bit NOT NULL,
    CONSTRAINT [PK_ProductImages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Reviews] (
    [Id] int NOT NULL IDENTITY,
    [ProductId] int NOT NULL,
    [CustomerId] int NOT NULL,
    [Rating] int NOT NULL,
    [Title] nvarchar(120) NOT NULL,
    [Comment] nvarchar(1000) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Reviews] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Reviews_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Reviews_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [OrderItems] (
    [Id] int NOT NULL IDENTITY,
    [SellerOrderId] int NOT NULL,
    [ProductId] int NOT NULL,
    [ProductName] nvarchar(200) NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [Quantity] int NOT NULL,
    [LineTotal] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_OrderItems_SellerOrders_SellerOrderId] FOREIGN KEY ([SellerOrderId]) REFERENCES [SellerOrders] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [SellerCommissions] (
    [Id] int NOT NULL IDENTITY,
    [SellerOrderId] int NOT NULL,
    [PercentageApplied] decimal(5,2) NOT NULL,
    [CommissionAmount] decimal(18,2) NOT NULL,
    [SellerEarning] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_SellerCommissions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SellerCommissions_SellerOrders_SellerOrderId] FOREIGN KEY ([SellerOrderId]) REFERENCES [SellerOrders] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Shippings] (
    [Id] int NOT NULL IDENTITY,
    [SellerOrderId] int NOT NULL,
    [Carrier] nvarchar(80) NOT NULL,
    [TrackingNumber] nvarchar(200) NOT NULL,
    [Status] nvarchar(80) NOT NULL,
    [ShippedAt] datetime2 NULL,
    [DeliveredAt] datetime2 NULL,
    CONSTRAINT [PK_Shippings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Shippings_SellerOrders_SellerOrderId] FOREIGN KEY ([SellerOrderId]) REFERENCES [SellerOrders] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_CartItems_CartId] ON [CartItems] ([CartId]);
GO


CREATE INDEX [IX_CartItems_ProductId] ON [CartItems] ([ProductId]);
GO


CREATE UNIQUE INDEX [IX_Carts_CustomerId] ON [Carts] ([CustomerId]);
GO


CREATE INDEX [IX_Categories_ParentId] ON [Categories] ([ParentId]);
GO


CREATE UNIQUE INDEX [IX_Categories_Slug] ON [Categories] ([Slug]);
GO


CREATE INDEX [IX_OrderItems_ProductId] ON [OrderItems] ([ProductId]);
GO


CREATE INDEX [IX_OrderItems_SellerOrderId] ON [OrderItems] ([SellerOrderId]);
GO


CREATE INDEX [IX_Orders_CustomerId] ON [Orders] ([CustomerId]);
GO


CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [Orders] ([OrderNumber]);
GO


CREATE INDEX [IX_ProductImages_ProductId] ON [ProductImages] ([ProductId]);
GO


CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
GO


CREATE INDEX [IX_Products_ShopId] ON [Products] ([ShopId]);
GO


CREATE INDEX [IX_Refunds_OrderId] ON [Refunds] ([OrderId]);
GO


CREATE INDEX [IX_Reviews_CustomerId] ON [Reviews] ([CustomerId]);
GO


CREATE INDEX [IX_Reviews_ProductId] ON [Reviews] ([ProductId]);
GO


CREATE INDEX [IX_SellerApplications_ShopId] ON [SellerApplications] ([ShopId]);
GO


CREATE INDEX [IX_SellerApplications_UserId] ON [SellerApplications] ([UserId]);
GO


CREATE INDEX [IX_SellerCommissions_SellerOrderId] ON [SellerCommissions] ([SellerOrderId]);
GO


CREATE INDEX [IX_SellerOrders_OrderId] ON [SellerOrders] ([OrderId]);
GO


CREATE UNIQUE INDEX [IX_SellerOrders_SellerOrderNumber] ON [SellerOrders] ([SellerOrderNumber]);
GO


CREATE INDEX [IX_SellerOrders_ShopId] ON [SellerOrders] ([ShopId]);
GO


CREATE INDEX [IX_SellerPayouts_ShopId] ON [SellerPayouts] ([ShopId]);
GO


CREATE INDEX [IX_Shippings_SellerOrderId] ON [Shippings] ([SellerOrderId]);
GO


CREATE INDEX [IX_ShopDocuments_ShopId] ON [ShopDocuments] ([ShopId]);
GO


CREATE UNIQUE INDEX [IX_Shops_OwnerUserId] ON [Shops] ([OwnerUserId]);
GO


CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
GO


