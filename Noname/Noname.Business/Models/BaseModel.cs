﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;
using System.ComponentModel.DataAnnotations;

namespace Abitcareer.Business.Models
{
    [AttributeUsage(AttributeTargets.Property, Inherited = false, AllowMultiple = false)]
    sealed class LocalizableFieldAttribute : Attribute
    {
    }

    public class BaseModel
    {
        
        public virtual string Id { get; set; }

        [LocalizableField]
        public virtual string Name { get; set; }

        public virtual Dictionary<string, string> Fields { get; set; }

        public virtual string Xml
        {
            get
            {
                return new XElement(
                     "fields",
                     Fields
                        .Select(x => new XElement("field", new XAttribute("key", x.Key), new XAttribute("value", x.Value))))
                        .ToString();
            }
            set
            {
                Fields = XElement
                    .Parse(value)
                    .Descendants("field")
                    .ToDictionary(x => (string)x.Attribute("key"), x => (string)x.Attribute("value"));
            }
        }

        public BaseModel()
        {
            Id = Guid.NewGuid().ToString();
            Fields = new Dictionary<string, string>();
        }
    }
}
