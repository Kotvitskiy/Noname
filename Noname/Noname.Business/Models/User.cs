﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SimpleCrypto;

namespace Abitcareer.Business.Models
{
    public class User
    {
        public virtual string Id { get; set; }

        public virtual string Email { get; set; }

        public virtual string PasswordSalt { get; set; }

        private string password;

        public virtual string Password { get; set; }

        public User()
        {
            Id = Guid.NewGuid().ToString();
        }
    }
}
