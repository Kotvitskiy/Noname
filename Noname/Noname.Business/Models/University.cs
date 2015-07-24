﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Abitcareer.Business.Models
{
    public class University
    {
        public virtual int Id { get; set; }

        public virtual string Name { get; set; }

        public virtual string NameEN { get; set; }

        public virtual int Rating { get; set; }

        public virtual string Link { get; set; }

        public virtual int CityId { get; set; }
    }
}